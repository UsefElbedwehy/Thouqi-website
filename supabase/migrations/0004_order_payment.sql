-- Payment tracking on orders: gateway reference + which provider processed it.
-- Order status moves pending → paid once the gateway confirms (webhook/callback).
alter table public.orders add column if not exists payment_ref text;
alter table public.orders add column if not exists payment_provider text;
