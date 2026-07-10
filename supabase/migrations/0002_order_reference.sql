-- Human-facing order reference (e.g. "TQ-ABC123"), distinct from the uuid PK.
alter table public.orders add column if not exists reference text;
create unique index if not exists orders_reference_key on public.orders(reference);
