# TODO (near-term working list)

Tracks the immediate next slices. Broader plan in [`ROADMAP.md`](ROADMAP.md).

## Done (M1)
- [x] Category listing `c/[...slug]` — sidebar (category tree + brand facets),
      sort/per-page, pagination, empty state, breadcrumbs
- [x] Product Details `p/[slug]` — gallery, variant selector, accordions,
      related products, `Product` JSON-LD
- [x] Search `search` (server) with `q` preserved across controls
- [x] SEO: `sitemap.ts` (hreflang), `robots.ts`, per-page alternates
- [x] Persisted cart store + header badge + functional Add to Bag

## Done (M2 — cart/wishlist/checkout)
- [x] Cart drawer + `/cart` page + qty steppers + header badge
- [x] Wishlist store + `/wishlist` page + hearts on cards & PDP + move-to-bag
- [x] Checkout `/checkout` + Zod `placeOrder` server action + confirmation

## Done (M2b — auth / account / orders)
- [x] Auth: register / sign in / sign out + combined intl+Supabase middleware
- [x] Account: protected shell, profile, orders list + detail, addresses CRUD
- [x] Persist orders (`orders`/`order_items`), server-side repriced + customer-linked

## Done (M3 — admin core complete)
- [x] Role-gated `/admin` shell + live dashboard stats
- [x] Products CRUD (AR/EN localized), Categories CRUD, Orders management
- [x] Customers (role toggle), Homepage builder, CMS pages, Settings/config editor
- [x] Storefront on remote config (`app_config`); CMS `/pages/[slug]`; footer links fixed

## Done (merchandising + search)
- [x] Collections admin (CRUD + product picker) + storefront `/collections/[slug]`
- [x] Offers/Sale page (`/offers`) + Sale nav wiring
- [x] Live-search typeahead (`/api/search` + header SearchBox) + PDP share row

## Next up (M3 follow-ups → M4)
- [ ] Admin: product variants/inventory editor; image-gallery upload to Storage
- [ ] Admin: remote nav/mega-menu editor
- [ ] Guest → account cart/wishlist merge on login
- [ ] Real product media in Storage (replace Unsplash)
- [x] Unit test suite (Vitest) + GitHub Actions CI
- [x] Payments: admin enable/disable + methods + secret key store + dynamic checkout
- [x] Live gateway flow: MyFatoorah/KNET provider + sandbox; redirect → webhook →
      callback → capture (verified via sandbox; needs the client's live key to go live)
- [ ] Go-live: obtain MyFatoorah key, set provider=knet, test one real KNET payment
- [ ] e2e tests (Playwright critical paths); reviews & ratings; analytics (GA4)

## Data
- [x] Implement `SupabaseCatalogRepository` methods (row → domain mapping)
- [x] `scripts/seed.ts`: push `catalog.data.ts` into Supabase (UUIDv5 mapping)
- [x] Apply `0001_init.sql` to the project and flip `DATA_SOURCE=supabase`
- [ ] Upload real product media to Storage; replace Unsplash URLs
- [ ] Implement orders/customers repositories (persist `placeOrder`, account data)

## Cross-cutting
- [ ] Real brand assets: `public/brand/logo.svg`, favicon, placeholder SVGs
- [ ] Mobile nav drawer (client island) for `< md`
- [ ] Hero carousel client upgrade (autoplay/controls)
- [ ] ESLint config + `npm run lint` in CI
- [ ] Unit tests for services + `MockCatalogRepository`

## Known follow-ups / tech debt
- `next/image` currently allows Unsplash for mock media — swap for Storage URLs.
- `SupabaseCatalogRepository` throws until wired (guard: `DATA_SOURCE=mock`).
- Add `error.tsx` boundaries per route segment.
