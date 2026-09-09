-- Cancelling keeps the row and its serial number (GST wants consecutive numbers, cancelled ones reported as such).
alter table invoices
  add column cancelled_at timestamptz,
  add column cancel_reason text;
