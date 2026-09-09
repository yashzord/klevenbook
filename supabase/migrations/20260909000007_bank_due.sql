-- How customers pay, printed on invoices, plus a due date so "overdue" means something.
alter table settings
  add column bank_name text,
  add column bank_account text,
  add column bank_ifsc text,
  add column upi_id text,
  add column payment_terms_days int not null default 30 check (payment_terms_days >= 0);
alter table invoices add column due_date date;

create or replace function create_invoice(inv jsonb, items jsonb) returns uuid
language plpgsql as $$
declare
  v_id uuid;
  v_num text;
  v_kind text := coalesce(inv->>'kind', 'invoice');
begin
  update sequences set next_number = next_number + 1 where kind = v_kind
    returning prefix || lpad((next_number - 1)::text, 4, '0') into v_num;
  if v_num is null then raise exception 'unknown document kind %', v_kind; end if;

  insert into invoices (kind, number, date, customer_id, vendor_id, gst_type, subtotal, cgst, sgst, igst, total, notes,
                        valid_until, reference, eway_bill, packages, source_id, due_date)
  values (
    v_kind, v_num,
    (inv->>'date')::date,
    (inv->>'customer_id')::uuid,
    (inv->>'vendor_id')::uuid,
    inv->>'gst_type',
    coalesce((inv->>'subtotal')::numeric, 0),
    coalesce((inv->>'cgst')::numeric, 0),
    coalesce((inv->>'sgst')::numeric, 0),
    coalesce((inv->>'igst')::numeric, 0),
    coalesce((inv->>'total')::numeric, 0),
    nullif(inv->>'notes', ''),
    (inv->>'valid_until')::date,
    nullif(inv->>'reference', ''),
    nullif(inv->>'eway_bill', ''),
    (inv->>'packages')::int,
    (inv->>'source_id')::uuid,
    (inv->>'due_date')::date
  ) returning id into v_id;

  insert into invoice_items (invoice_id, product_id, description, hsn, unit, qty, rate, gst_rate, amount, tax, batch)
  select v_id,
         (i->>'product_id')::uuid, i->>'description', i->>'hsn', i->>'unit',
         (i->>'qty')::numeric, coalesce((i->>'rate')::numeric, 0), coalesce((i->>'gst_rate')::numeric, 0),
         coalesce((i->>'amount')::numeric, 0), coalesce((i->>'tax')::numeric, 0), nullif(i->>'batch', '')
  from jsonb_array_elements(items) i;

  return v_id;
end $$;

-- Public share page needs the payment details too.
create or replace function shared_document(token uuid) returns jsonb
language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'doc', to_jsonb(i) - 'share_token',
    'customer', to_jsonb(c),
    'items', (select coalesce(jsonb_agg(to_jsonb(it) order by it.id), '[]'::jsonb) from invoice_items it where it.invoice_id = i.id),
    'source', (select jsonb_build_object('number', s.number, 'kind', s.kind) from invoices s where s.id = i.source_id),
    'settings', (select jsonb_build_object('business_name', business_name, 'gstin', gstin, 'address', address, 'state_code', state_code,
                                            'phone', phone, 'email', email, 'quotation_terms', quotation_terms, 'challan_notes', challan_notes,
                                            'bank_name', bank_name, 'bank_account', bank_account, 'bank_ifsc', bank_ifsc, 'upi_id', upi_id,
                                            'payment_terms_days', payment_terms_days) from settings where id = 1)
  )
  from invoices i join customers c on c.id = i.customer_id
  where i.share_token = token
$$;
