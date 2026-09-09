-- KlevenBook v0 schema. One business, every signed-in user is staff.
-- Migrations are additive only. Never drop or rename here; add a new migration instead.

create table settings (
  id int primary key default 1 check (id = 1), -- single row
  business_name text not null,
  gstin text,
  address text,
  state_code char(2) not null,
  phone text,
  email text,
  invoice_prefix text not null default 'INV-',
  next_number int not null default 1
);
insert into settings (business_name, state_code) values ('My Business', '36');

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  hsn text,
  unit text not null default 'pcs',
  price numeric(12,2) not null default 0,
  gst_rate numeric(4,2) not null default 5,
  created_at timestamptz not null default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gstin text,
  state_code char(2) not null,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  date date not null default current_date,
  customer_id uuid not null references customers,
  gst_type text not null check (gst_type in ('cgst_sgst', 'igst')),
  subtotal numeric(12,2) not null,
  cgst numeric(12,2) not null default 0,
  sgst numeric(12,2) not null default 0,
  igst numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  notes text,
  created_at timestamptz not null default now()
);

create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices on delete cascade,
  product_id uuid references products,
  description text not null,
  hsn text,
  unit text,
  qty numeric(12,3) not null,
  rate numeric(12,2) not null,
  gst_rate numeric(4,2) not null,
  amount numeric(12,2) not null,
  tax numeric(12,2) not null
);

-- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
-- ponytail: one policy per table, "signed in = full access". Add roles when a second business or a read-only staffer appears.
alter table settings enable row level security;
alter table products enable row level security;
alter table customers enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
create policy staff_all on settings for all to authenticated using (true) with check (true);
create policy staff_all on products for all to authenticated using (true) with check (true);
create policy staff_all on customers for all to authenticated using (true) with check (true);
create policy staff_all on invoices for all to authenticated using (true) with check (true);
create policy staff_all on invoice_items for all to authenticated using (true) with check (true);

-- Creates invoice + items and takes the next serial number in ONE transaction, so numbers never skip.
-- GST rule 46 requires consecutive serial numbers: https://cbic-gst.gov.in/cgst-rules.html
create function create_invoice(inv jsonb, items jsonb) returns uuid
language plpgsql as $$
declare
  v_id uuid;
  v_num text;
begin
  update settings set next_number = next_number + 1 where id = 1
    returning invoice_prefix || lpad((next_number - 1)::text, 4, '0') into v_num;

  insert into invoices (number, date, customer_id, gst_type, subtotal, cgst, sgst, igst, total, notes)
  values (
    v_num,
    (inv->>'date')::date,
    (inv->>'customer_id')::uuid,
    inv->>'gst_type',
    (inv->>'subtotal')::numeric,
    (inv->>'cgst')::numeric,
    (inv->>'sgst')::numeric,
    (inv->>'igst')::numeric,
    (inv->>'total')::numeric,
    nullif(inv->>'notes', '')
  ) returning id into v_id;

  insert into invoice_items (invoice_id, product_id, description, hsn, unit, qty, rate, gst_rate, amount, tax)
  select v_id,
         (i->>'product_id')::uuid, i->>'description', i->>'hsn', i->>'unit',
         (i->>'qty')::numeric, (i->>'rate')::numeric, (i->>'gst_rate')::numeric,
         (i->>'amount')::numeric, (i->>'tax')::numeric
  from jsonb_array_elements(items) i;

  return v_id;
end $$;
