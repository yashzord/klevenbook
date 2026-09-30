-- Vendor bank details, so paying a vendor needs no second lookup.
alter table vendors
  add column bank_name text,
  add column bank_account text,
  add column bank_ifsc text,
  add column upi_id text;

-- Edit a document after it is made. Number, kind, source and share link stay; everything else is replaced.
-- One transaction, so a failed edit never leaves a document with half its lines.
create function update_document(doc_id uuid, inv jsonb, items jsonb) returns uuid
language plpgsql as $$
begin
  update invoices set
    date = (inv->>'date')::date,
    customer_id = (inv->>'customer_id')::uuid,
    vendor_id = (inv->>'vendor_id')::uuid,
    gst_type = inv->>'gst_type',
    subtotal = coalesce((inv->>'subtotal')::numeric, 0),
    cgst = coalesce((inv->>'cgst')::numeric, 0),
    sgst = coalesce((inv->>'sgst')::numeric, 0),
    igst = coalesce((inv->>'igst')::numeric, 0),
    total = coalesce((inv->>'total')::numeric, 0),
    notes = nullif(inv->>'notes', ''),
    valid_until = (inv->>'valid_until')::date,
    reference = nullif(inv->>'reference', ''),
    eway_bill = nullif(inv->>'eway_bill', ''),
    packages = (inv->>'packages')::int,
    due_date = (inv->>'due_date')::date
  where id = doc_id and kind = inv->>'kind' and cancelled_at is null;
  if not found then raise exception 'document not found, of another type, or cancelled'; end if;

  delete from invoice_items where invoice_id = doc_id;
  insert into invoice_items (invoice_id, product_id, description, hsn, unit, qty, rate, gst_rate, amount, tax, batch)
  select doc_id,
         (i->>'product_id')::uuid, i->>'description', i->>'hsn', i->>'unit',
         (i->>'qty')::numeric, coalesce((i->>'rate')::numeric, 0), coalesce((i->>'gst_rate')::numeric, 0),
         coalesce((i->>'amount')::numeric, 0), coalesce((i->>'tax')::numeric, 0), nullif(i->>'batch', '')
  from jsonb_array_elements(items) i;

  return doc_id;
end $$;
