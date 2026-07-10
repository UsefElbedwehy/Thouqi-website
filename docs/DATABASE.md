# Database Design

PostgreSQL via Supabase. Schema lives in `supabase/migrations/`.

## Principles

- **Localized content as JSONB** — `name`, `description`, `title`, etc. are
  `{ "en": "...", "ar": "..." }` maps. Adding a language requires **no schema
  change** and matches the app's `LocalizedText` model + config approach.
- **Money as integers** — prices are `bigint` minor units. The currency's
  fraction digits come from config (KWD = 3 → `48000` = `KD48.000`). No floats.
- **RLS on every table** — the anon key is safe client-side; access is governed
  by policies. Catalog/content is publicly readable (published rows only);
  writes require the `admin` role; customer rows are owner-scoped. The
  service-role key (server-only) bypasses RLS for trusted admin/service code.

## Tables

| Table | Purpose |
| --- | --- |
| `app_config` | Remote branding/nav/homepage/flags + asset overrides |
| `brands` | Multi-brand marketplace brands |
| `categories` | Nested categories (`parent_id`), sortable, visibility flag |
| `products` | Core product; denormalized `price`/`compare_at_price` |
| `product_categories` | Product ↔ category (M:N) |
| `product_images` | Ordered gallery images |
| `product_variants` | SKU-level options, price, inventory |
| `collections` / `collection_products` | Featured/seasonal/offer groupings |
| `banners` | Hero/promo slides referenced by homepage sections |
| `customers` | Profile + `role` (`customer`/`admin`) + preferred `locale` |
| `addresses` | Customer addresses |
| `orders` / `order_items` | Orders with localized name snapshots |
| `wishlist_items` | Customer wishlist |
| `reviews` | Product reviews (moderated via `approved`) |
| `cms_pages` | About/Contact/FAQ/policies + dynamic pages (localized rich text) |

## Relationships (high level)

```
brands 1─* products *─* categories (via product_categories)
products 1─* product_images
products 1─* product_variants
collections *─* products (via collection_products)
customers 1─* addresses, orders, wishlist_items, reviews
orders 1─* order_items
auth.users 1─1 customers   (auto-created via trigger)
```

## Conventions

- UUID primary keys (`gen_random_uuid()`).
- `updated_at` maintained by triggers where mutation history matters.
- New `auth.users` automatically get a `customers` row (`handle_new_user`).
- Slugs are unique and used for SEO-friendly routing.

## Applying

```bash
# Via Supabase CLI (recommended)
supabase db push
# or paste supabase/migrations/0001_init.sql into the SQL editor.
```

Then seed with `npm run seed` (see `docs/DEPLOYMENT.md`). The seed writer maps
the canonical mock data (`src/data/mock/catalog.data.ts`) into these tables so
mock and live datasets stay identical.
