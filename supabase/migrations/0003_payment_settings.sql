-- ============================================================================
-- Payment gateway secrets. SERVER-ONLY: RLS grants no public read — only
-- admins (and the service role) may touch this row. The gateway API key must
-- NEVER be placed in `app_config.config` (which is rendered client-side).
-- Single-row table (id fixed to true).
-- ============================================================================
create table if not exists public.payment_settings (
  id          boolean primary key default true,
  provider    text,
  api_key     text,
  test_mode   boolean not null default true,
  updated_at  timestamptz not null default now(),
  constraint payment_settings_singleton check (id)
);

alter table public.payment_settings enable row level security;

-- Admins only (service role bypasses RLS). No public SELECT policy => not readable
-- with the anon key.
drop policy if exists admin_all_payment_settings on public.payment_settings;
create policy admin_all_payment_settings on public.payment_settings
  for all using (is_admin()) with check (is_admin());

create trigger payment_settings_updated before update on public.payment_settings
  for each row execute function set_updated_at();
