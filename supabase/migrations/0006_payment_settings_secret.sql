-- SADAD Pay (and any future two-credential gateway) needs a client key + a
-- separate secret key, not just the single api_key column.
alter table public.payment_settings add column if not exists api_secret text;
