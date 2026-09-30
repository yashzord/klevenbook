-- A customer or vendor that is on documents cannot be deleted, so it can be hidden instead:
-- gone from the pickers on new documents, still intact on every old document.
alter table customers add column hidden boolean not null default false;
alter table vendors add column hidden boolean not null default false;
