-- Money received against an invoice. Several part payments may exist; paid = sum(amount).
create table payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices on delete cascade,
  date date not null default current_date,
  amount numeric(12,2) not null check (amount > 0),
  method text not null default 'bank' check (method in ('bank', 'upi', 'cash', 'cheque', 'other')),
  reference text,  -- UTR, cheque number, etc.
  created_at timestamptz not null default now()
);
create index payments_invoice_idx on payments (invoice_id);
alter table payments enable row level security;
create policy staff_all on payments for all to authenticated using (true) with check (true);
