-- ============================================================================
-- THOUQi Platform — initial schema
-- Scalable, multilingual e-commerce core. Localized text is stored as JSONB
-- maps ({ "en": "...", "ar": "..." }) so ANY number of languages is supported
-- without schema changes — mirroring the app's LocalizedText model.
-- All tables are RLS-enabled: catalog is publicly readable, writes require the
-- `admin` role; customer-owned rows are scoped to the owner.
-- ============================================================================

create extension if not exists "pgcrypto";

-- --- helper: updated_at trigger -------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- --- helper: is current user an admin? ------------------------------------
-- Roles are stored on the customer profile; admin ops use the service role,
-- but this lets authenticated admins operate under RLS too. Declared as
-- plpgsql so the reference to public.customers resolves at run time (the table
-- is created later in this migration).
create or replace function is_admin()
returns boolean language plpgsql stable security definer set search_path = public as $$
begin
  return exists (
    select 1 from public.customers
    where id = auth.uid() and role = 'admin'
  );
end $$;

-- ============================================================================
-- Remote configuration (single source for branding/nav/homepage/flags)
-- ============================================================================
create table public.app_config (
  key         text primary key default 'default',
  config      jsonb not null default '{}'::jsonb,
  assets      jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
create trigger app_config_updated before update on public.app_config
  for each row execute function set_updated_at();

-- ============================================================================
-- Catalog
-- ============================================================================
create table public.brands (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       jsonb not null,           -- LocalizedText
  logo_url   text,
  created_at timestamptz not null default now()
);

create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       jsonb not null,
  parent_id  uuid references public.categories(id) on delete set null,
  image_url  text,
  sort_order int not null default 0,
  visible    boolean not null default true,
  created_at timestamptz not null default now()
);
create index on public.categories(parent_id);

create table public.products (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             jsonb not null,
  description      jsonb not null default '{}'::jsonb,
  brand_id         uuid references public.brands(id) on delete set null,
  price            bigint not null,      -- minor units (KWD = 3 digits)
  compare_at_price bigint,
  details          jsonb not null default '[]'::jsonb,  -- LocalizedText[]
  available        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index on public.products(brand_id);
create index on public.products(created_at desc);
create trigger products_updated before update on public.products
  for each row execute function set_updated_at();

-- product ↔ category (many-to-many)
create table public.product_categories (
  product_id  uuid references public.products(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url        text not null,
  alt        jsonb not null default '{}'::jsonb,
  sort_order int not null default 0
);
create index on public.product_images(product_id);

create table public.product_variants (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null references public.products(id) on delete cascade,
  sku              text unique not null,
  options          jsonb not null default '{}'::jsonb,  -- { size, color, ... }
  price            bigint not null,
  compare_at_price bigint,
  inventory        int not null default 0
);
create index on public.product_variants(product_id);

create table public.collections (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        jsonb not null,
  subtitle     jsonb,
  banner_image text,
  created_at   timestamptz not null default now()
);

create table public.collection_products (
  collection_id uuid references public.collections(id) on delete cascade,
  product_id    uuid references public.products(id) on delete cascade,
  sort_order    int not null default 0,
  primary key (collection_id, product_id)
);

create table public.banners (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  title      jsonb not null,
  subtitle   jsonb,
  cta_label  jsonb,
  href       text not null,
  image_url  text not null,
  image_alt  jsonb not null default '{}'::jsonb,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Customers, addresses (auth.users is the identity source)
-- ============================================================================
create table public.customers (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  phone      text,
  role       text not null default 'customer',  -- 'customer' | 'admin'
  locale     text not null default 'ar',
  created_at timestamptz not null default now()
);

create table public.addresses (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references public.customers(id) on delete cascade,
  label        text,
  line1        text not null,
  line2        text,
  city         text,
  area         text,
  country_code text not null default 'KW',
  phone        text,
  is_default   boolean not null default false,
  created_at   timestamptz not null default now()
);
create index on public.addresses(customer_id);

-- ============================================================================
-- Orders
-- ============================================================================
create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid references public.customers(id) on delete set null,
  status          text not null default 'pending',  -- pending|paid|shipped|delivered|cancelled|refunded
  currency        text not null default 'KWD',
  subtotal        bigint not null default 0,
  shipping_total  bigint not null default 0,
  tax_total       bigint not null default 0,
  grand_total     bigint not null default 0,
  shipping_address jsonb,
  tracking_number text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index on public.orders(customer_id);
create trigger orders_updated before update on public.orders
  for each row execute function set_updated_at();

create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  variant_id    uuid references public.product_variants(id) on delete set null,
  name_snapshot jsonb not null,   -- localized name captured at purchase time
  unit_price    bigint not null,
  quantity      int not null default 1
);
create index on public.order_items(order_id);

-- ============================================================================
-- Wishlist & reviews
-- ============================================================================
create table public.wishlist_items (
  customer_id uuid references public.customers(id) on delete cascade,
  product_id  uuid references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (customer_id, product_id)
);

create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  rating      int not null check (rating between 1 and 5),
  body        text,
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index on public.reviews(product_id);

-- ============================================================================
-- CMS pages (About, Contact, FAQ, policies, dynamic pages)
-- ============================================================================
create table public.cms_pages (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  title      jsonb not null,
  body       jsonb not null default '{}'::jsonb,  -- localized rich text (HTML/portable)
  published  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger cms_pages_updated before update on public.cms_pages
  for each row execute function set_updated_at();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.app_config          enable row level security;
alter table public.brands               enable row level security;
alter table public.categories           enable row level security;
alter table public.products             enable row level security;
alter table public.product_categories   enable row level security;
alter table public.product_images       enable row level security;
alter table public.product_variants     enable row level security;
alter table public.collections          enable row level security;
alter table public.collection_products  enable row level security;
alter table public.banners              enable row level security;
alter table public.customers            enable row level security;
alter table public.addresses            enable row level security;
alter table public.orders               enable row level security;
alter table public.order_items          enable row level security;
alter table public.wishlist_items       enable row level security;
alter table public.reviews              enable row level security;
alter table public.cms_pages            enable row level security;

-- Public read for catalog/content (published only where applicable).
create policy public_read_config    on public.app_config         for select using (true);
create policy public_read_brands    on public.brands             for select using (true);
create policy public_read_cats      on public.categories         for select using (visible or is_admin());
create policy public_read_products  on public.products           for select using (true);
create policy public_read_pcats     on public.product_categories for select using (true);
create policy public_read_pimages   on public.product_images     for select using (true);
create policy public_read_variants  on public.product_variants   for select using (true);
create policy public_read_colls     on public.collections        for select using (true);
create policy public_read_collp     on public.collection_products for select using (true);
create policy public_read_banners   on public.banners            for select using (active or is_admin());
create policy public_read_reviews   on public.reviews            for select using (approved or is_admin());
create policy public_read_cms       on public.cms_pages          for select using (published or is_admin());

-- Admin write on catalog/content (service role bypasses RLS entirely).
create policy admin_write_config   on public.app_config          for all using (is_admin()) with check (is_admin());
create policy admin_write_brands   on public.brands              for all using (is_admin()) with check (is_admin());
create policy admin_write_cats     on public.categories          for all using (is_admin()) with check (is_admin());
create policy admin_write_products on public.products            for all using (is_admin()) with check (is_admin());
create policy admin_write_pcats    on public.product_categories  for all using (is_admin()) with check (is_admin());
create policy admin_write_pimages  on public.product_images      for all using (is_admin()) with check (is_admin());
create policy admin_write_variants on public.product_variants    for all using (is_admin()) with check (is_admin());
create policy admin_write_colls    on public.collections         for all using (is_admin()) with check (is_admin());
create policy admin_write_collp    on public.collection_products for all using (is_admin()) with check (is_admin());
create policy admin_write_banners  on public.banners             for all using (is_admin()) with check (is_admin());
create policy admin_write_cms      on public.cms_pages           for all using (is_admin()) with check (is_admin());

-- Customer-owned rows.
create policy own_customer   on public.customers      for select using (id = auth.uid() or is_admin());
create policy upd_customer   on public.customers      for update using (id = auth.uid());
create policy own_addresses  on public.addresses      for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy own_orders     on public.orders         for select using (customer_id = auth.uid() or is_admin());
create policy own_order_items on public.order_items   for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.customer_id = auth.uid() or is_admin()))
);
create policy own_wishlist   on public.wishlist_items for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy write_reviews  on public.reviews        for insert with check (customer_id = auth.uid());

-- New auth users get a customer profile automatically.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.customers (id, email, full_name, locale)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name',
          coalesce(new.raw_user_meta_data->>'locale', 'ar'));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
