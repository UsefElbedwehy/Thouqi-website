# Implementation Roadmap

Milestones are ordered to keep the app **shippable at every step**. Each builds
on the backend-agnostic foundation (config → i18n → data layer → UI).

Legend: ✅ done · 🚧 in progress · ⬜ planned

## M0 — Foundation ✅
- ✅ Next.js 15 + TS (strict) + Tailwind v4, App Router, RSC
- ✅ Config system (defaults + remote-merge, feature flags, assets)
- ✅ Design-token theming (CSS vars, no hardcoded colors)
- ✅ i18n: AR (default) + EN, RTL/LTR, locale-prefixed routes, ICU catalogs
- ✅ Backend-agnostic data layer (service → repository → mock/Supabase + DI)
- ✅ Storefront shell: header + mega nav, footer, language switch
- ✅ Homepage page-builder (hero, product rails, category grid, promo banner)
- ✅ Product card with sale handling + KWD formatting
- ✅ Database schema + RLS (`supabase/migrations/0001_init.sql`)
- ✅ Docs: architecture, config, i18n, database, deployment, ADRs

## M1 — Catalog browsing 🚧
- ✅ Category listing page: left filters (category tree, brand facets), sort, per-page, pagination (URL-driven)
- ✅ Product Details page: gallery, variant selector, details/size/delivery accordions, related products
- ✅ Search page (server search) + `q` preserved across sort/pagination
- ✅ `hreflang` alternates (sitemap + per-page), localized `Product` JSON-LD, `robots.ts`
- ✅ Cart store (persisted) + live header cart badge (Add to Bag functional)
- ✅ **Live Supabase backend**: migration applied, catalog seeded,
      `SupabaseCatalogRepository` implemented, `DATA_SOURCE=supabase` verified
- ⬜ Collections & Offers pages
- ⬜ Live search island (feature-flagged) + PDP social share row

## M2 — Commerce 🚧
- ✅ Cart (Zustand + persisted): slide-over drawer + full `/cart` page, qty stepper, header badge
- ✅ Wishlist (guest): store + `/wishlist` page + hearts wired on cards & PDP + move-to-bag
- ✅ Checkout: single-page flow (contact, address, shipping method, payment) with
      Zod-validated `placeOrder` server action + order confirmation
- ✅ Auth (Supabase): register / sign in / sign out, combined next-intl +
      Supabase session middleware, auth-aware header
- ✅ Account: protected shell, profile edit, orders list + detail, addresses CRUD
- ✅ Persist orders to `orders`/`order_items` (server-side repriced, customer-linked)
- ⬜ Guest→account cart/wishlist merge on login

## M3 — Admin Dashboard ✅ (core complete)
- ✅ Role-gated `/admin` shell (`is_admin`), standalone chrome, live dashboard stats
- ✅ Products CRUD (localized AR/EN fields, brand, category, image, pricing, availability)
- ✅ Categories CRUD (nested parent, sort order, visibility)
- ✅ Orders management (status + tracking updates; feeds dashboard revenue)
- ✅ Customers management (list + admin role toggle)
- ✅ **Homepage builder** (reorder/toggle sections → `app_config` → storefront)
- ✅ **CMS pages** editor (localized title/HTML body, publish) + storefront `/pages/[slug]`
- ✅ **Settings / remote-config editor** (brand name, palette, feature flags → `app_config`);
      storefront now runs `NEXT_PUBLIC_CONFIG_SOURCE=remote`
- ✅ Collections admin (CRUD + product picker) + storefront `/collections/[slug]`
- ✅ Offers/Sale storefront page + live-search typeahead + PDP social share
- ⬜ Follow-ups: product variants/inventory & image-gallery (Storage) editors,
      remote nav editor

## M4 — Hardening & launch
- ⬜ Reviews & ratings (moderation)
- ✅ Payments — admin-toggleable methods + secret key store + dynamic checkout
      (COD-only by default); MyFatoorah/KNET provider + sandbox; redirect →
      webhook → callback → capture flow (production-ready pending the live key)
- 🚧 Test suite — ✅ unit (Vitest, 42 tests); ⬜ e2e (Playwright critical paths)
- ⬜ a11y audit (WCAG 2.1 AA), performance budget, SEO sitemap/robots
- ✅ CI pipeline (GitHub Actions: typecheck → test → hermetic build); ⬜ preview deploys
- ⬜ Blog (feature-flagged), analytics (GA4)

See [`TODO.md`](TODO.md) for the near-term working list.
