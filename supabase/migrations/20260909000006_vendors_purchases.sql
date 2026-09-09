-- Purchase bills: what we bought from vendors. Same table and editor as sales documents, kind = 'purchase'.
create table vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gstin text,
  state_code char(2) not null,
  phone text,
  address text,
  created_at timestamptz not null default now()
);
alter table vendors enable row level security;
create policy staff_all on vendors for all to authenticated using (true) with check (true);

alter table invoices drop constraint invoices_kind_check;
alter table invoices add constraint invoices_kind_check check (kind in ('invoice', 'quotation', 'challan', 'purchase'));
alter table sequences drop constraint sequences_kind_check;
alter table sequences add constraint sequences_kind_check check (kind in ('invoice', 'quotation', 'challan', 'purchase'));
insert into sequences (kind, prefix) values ('purchase', 'PB-');

alter table invoices add column vendor_id uuid references vendors;
alter table invoices alter column customer_id drop not null;
-- A purchase has a vendor and no customer; everything else the reverse.
alter table invoices add constraint invoices_party_check
  check ((kind = 'purchase' and vendor_id is not null and customer_id is null) or (kind <> 'purchase' and customer_id is not null and vendor_id is null));

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
                        valid_until, reference, eway_bill, packages, source_id)
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
    (inv->>'source_id')::uuid
  ) returning id into v_id;

  insert into invoice_items (invoice_id, product_id, description, hsn, unit, qty, rate, gst_rate, amount, tax, batch)
  select v_id,
         (i->>'product_id')::uuid, i->>'description', i->>'hsn', i->>'unit',
         (i->>'qty')::numeric, coalesce((i->>'rate')::numeric, 0), coalesce((i->>'gst_rate')::numeric, 0),
         coalesce((i->>'amount')::numeric, 0), coalesce((i->>'tax')::numeric, 0), nullif(i->>'batch', '')
  from jsonb_array_elements(items) i;

  return v_id;
end $$;
