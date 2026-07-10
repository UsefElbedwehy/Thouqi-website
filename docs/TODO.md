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

## Done (M3 follow-ups → M4)
- [x] Admin: product variants/inventory editor (per-size stock, stable SKUs on save)
- [x] Admin: remote nav/mega-menu editor (`/admin/navigation` → `app_config.navigation`)
- [x] Guest → account cart/wishlist merge on login (+ ongoing sync while signed in)
- [x] Admin image upload to Storage (`product-media` bucket)
- [x] Unit test suite (Vitest) + GitHub Actions CI (lint → typecheck → test → build)
- [x] Payments: admin enable/disable + methods + secret key store + dynamic checkout
- [x] Live gateway flow: MyFatoorah/KNET provider + sandbox; redirect → webhook →
      callback → capture (verified via sandbox; needs the client's live key to go live)
- [x] Reviews & ratings: PDP submit form + rating summary, admin moderation queue
- [x] Mobile nav drawer (accordion, RTL-aware) for `< md`
- [x] Hero carousel (autoplay, pause-on-hover, arrows/dots) — replaces the static SSR hero
- [x] error.tsx boundaries: storefront, admin, and global-error
- [x] ESLint config (flat config, `next/core-web-vitals` + `next/typescript`) + `npm run lint` in CI
- [x] Analytics: GA4 via gtag.js, feature-flagged on `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
      (off unless set — currently set, so it's live)
- [ ] Go-live: obtain MyFatoorah key, set provider=knet, test one real KNET payment
- [x] e2e tests (Playwright): browse→cart→checkout, admin login→create/edit/delete
      product. Runs against the live Supabase project, not CI's hermetic build —
      see README "Testing & CI" — `npm run test:e2e`

## Data
- [x] Implement `SupabaseCatalogRepository` methods (row → domain mapping) — live, `DATA_SOURCE=supabase`
- [x] `scripts/seed.ts`: push `catalog.data.ts` into Supabase (UUIDv5 mapping)
- [x] Implement orders/customers/wishlist repositories (persist `placeOrder`, account data, wishlist sync)
- [ ] Upload real product media to Storage; replace placeholder SVGs

## Cross-cutting
- [ ] Real brand assets: `public/brand/logo.svg`, favicon, placeholder SVGs
- [x] Unit tests for services + `MockCatalogRepository` (+ wishlist store)

## Known follow-ups / tech debt
- Placeholder SVG media (`/assets/ph/*.svg`) still stands in for real product photos.
