-- Every document gets an unguessable token so a customer can open it from a WhatsApp link without logging in.
alter table invoices add column share_token uuid not null default gen_random_uuid();
create unique index invoices_share_token_idx on invoices (share_token);

-- The only thing the public can read, and only with the token. SECURITY DEFINER bypasses RLS for this one lookup.
-- https://supabase.com/docs/guides/database/functions#security-definer-vs-invoker
create or replace function shared_document(token uuid) returns jsonb
language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'doc', to_jsonb(i) - 'share_token',
    'customer', to_jsonb(c),
    'items', (select coalesce(jsonb_agg(to_jsonb(it) order by it.id), '[]'::jsonb) from invoice_items it where it.invoice_id = i.id),
    'source', (select jsonb_build_object('number', s.number, 'kind', s.kind) from invoices s where s.id = i.source_id),
    'settings', (select jsonb_build_object('business_name', business_name, 'gstin', gstin, 'address', address, 'state_code', state_code,
                                            'phone', phone, 'email', email, 'quotation_terms', quotation_terms, 'challan_notes', challan_notes) from settings where id = 1)
  )
  from invoices i join customers c on c.id = i.customer_id
  where i.share_token = token
$$;
revoke all on function shared_document(uuid) from public;
grant execute on function shared_document(uuid) to anon, authenticated;
