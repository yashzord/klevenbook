-- Quotations and delivery challans share the invoices table, told apart by `kind`.
-- Additive only: nothing dropped. settings.invoice_prefix / next_number stay but are no longer read;
-- numbering moved to `sequences` so each kind counts on its own.

alter table invoices
  add column kind text not null default 'invoice' check (kind in ('invoice', 'quotation', 'challan')),
  add column valid_until date,          -- quotation
  add column reference text,            -- customer PO / reference number
  add column eway_bill text,            -- challan
  add column packages int,              -- challan: total number of packages
  add column source_id uuid references invoices; -- quotation an invoice came from, or invoice a challan ships

alter table invoices alter column subtotal set default 0;
alter table invoices alter column total set default 0;

alter table invoice_items add column batch text; -- batch / serial number, used on challans

create index invoices_kind_created_idx on invoices (kind, created_at desc);

create table sequences (
  kind text primary key check (kind in ('invoice', 'quotation', 'challan')),
  prefix text not null,
  next_number int not null default 1
);
insert into sequences (kind, prefix, next_number) select 'invoice', invoice_prefix, next_number from settings where id = 1;
insert into sequences (kind, prefix) values ('quotation', 'QT-'), ('challan', 'DC-');
alter table sequences enable row level security;
create policy staff_all on sequences for all to authenticated using (true) with check (true);

-- Editable boilerplate printed on the documents.
alter table settings
  add column quotation_terms text,
  add column challan_notes text;
update settings set
  quotation_terms = E'1. Delivery: within 4 to 8 weeks from receipt of a confirmed purchase order.\n2. GST: charged extra as applicable.\n3. Payment: 100% advance along with the confirmed purchase order.\n4. Validity: this quotation is valid for 30 days from the date of issue.\n5. Warranty: all products carry the manufacturer''s warranty and certifications as applicable.\n6. Prices: quoted on ex-works / FOR destination basis as specified.\n7. Jurisdiction: disputes are subject to the exclusive jurisdiction of courts in Hyderabad, Telangana.',
  challan_notes = E'1. Verification: goods to be checked at delivery for quantity, packaging and apparent condition.\n2. Damages or shortages: note any discrepancy on this challan and report it within 24 hours of receipt.\n3. Copies: original for consignee, duplicate for transporter, triplicate for consignor.\n4. E-way bill: where applicable under GST rules, the e-way bill must accompany this challan in transit.\n5. Jurisdiction: disputes are subject to the exclusive jurisdiction of courts in Hyderabad, Telangana.'
where id = 1;

-- Same one-transaction guarantee as before, now per kind. Serial numbers never skip.
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

  insert into invoices (kind, number, date, customer_id, gst_type, subtotal, cgst, sgst, igst, total, notes,
                        valid_until, reference, eway_bill, packages, source_id)
  values (
    v_kind, v_num,
    (inv->>'date')::date,
    (inv->>'customer_id')::uuid,
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
