# Changelog

All notable changes to this project are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versions are pre-1.0.

## [Unreleased]

### Added — M4 hardening batch (variants, nav editor, reviews, mobile, hardening)
- **Admin: per-size inventory editor** — `ProductForm` now tracks stock per
  selected size (was one shared count for all sizes); `saveProductAction`
  upserts `product_variants` by SKU instead of delete+reinsert, so variant ids
  survive edits (`order_items.variant_id` stays valid).
- **Admin: remote nav/mega-menu editor** (`/admin/navigation`) — reorderable
  top-level items + mega-menu columns/links, localized EN/AR, writes to
  `app_config.navigation`; storefront header picks it up immediately.
- **Guest → account wishlist merge on login** — `mergeWishlistAction` pushes
  the guest's local wishlist into `wishlist_items` at sign-in and pulls back
  anything saved on the account from another session; `setWishlistItemAction`
  keeps the server copy in sync on every toggle/remove while signed in (not
  just at login). Cart intentionally needs no merge — it's browser-scoped
  localStorage with no server table.
- **Mobile nav drawer** — slide-over accordion menu (`< md`, RTL-aware),
  mirrors the mega-nav data since `MegaNav` itself is desktop-only.
- **Hero carousel** — autoplays through all active banners, pauses on
  hover/focus, arrow + dot controls; replaces the single static SSR slide.
- **Reviews & ratings** — PDP star-rating submit form + average/count summary
  + approved-review list (gated by `config.features.reviews`); admin
  moderation queue (`/admin/reviews`) to approve/reject pending reviews.
- **error.tsx boundaries** — storefront-wide, admin-scoped (English chrome),
  and a root `global-error.tsx` for failures in the root layout itself.
- **ESLint** — flat config (`next/core-web-vitals` + `next/typescript`);
  `npm run lint` is clean; CI now runs lint → typecheck → test → build.
- **Analytics** — GA4 via `gtag.js`, feature-flagged on
  `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (off unless set); fires `page_view` on
  every client-side route change since the App Router doesn't do this itself.
- Added `tests/wishlist-store.test.ts` (toggle/remove/merge); 47 unit tests total.
- **e2e (Playwright)** — `e2e/storefront.spec.ts` (browse → add to bag → reach
  checkout) and `e2e/admin.spec.ts` (sign in → create/edit/delete a product,
  self-cleaning). Integration tests against the real Supabase project, so kept
  out of the CI job (which builds hermetically); run via `npm run test:e2e`.

### Added — Live payment flow (KNET/MyFatoorah + sandbox)
- **`PaymentProvider` abstraction** with two implementations: a production-ready
  **MyFatoorah** provider (KNET + cards; SendPayment / getPaymentStatus) and a
  built-in **sandbox** gateway so the whole flow is testable with no merchant
  account. Selected via provider in admin (adds a "Sandbox" option).
- **Redirect → webhook → callback → capture**: checkout for an online method
  creates a `pending` order, initiates a hosted payment, and redirects the
  shopper; the gateway confirms via an **idempotent, secret-authenticated
  webhook** (`/api/payments/webhook`); the browser returns to
  `/api/payments/callback` which **re-verifies server-side** and finalizes;
  `/checkout/complete` shows the result and clears the cart on success.
- New order columns `payment_ref` / `payment_provider` (migration `0004`);
  `markOrderPaid` is idempotent (pending → paid only).
- Payment amount now charges the **grand total** (items + shipping).
- Verified end-to-end via sandbox: KNET checkout → gateway (KD31.500 incl.
  shipping) → Approve → order **paid** (confirmed in DB, revenue updated) → cart
  cleared; Decline → order stays **pending**, cart preserved; webhook **rejects
  forged calls (401)**. Reverted to the safe COD-only default afterward.

### Added — Payments (admin-toggleable, deploy without a gateway key)
- **Config-driven payment methods** (`config.payments`): master online switch +
  per-method visibility (COD / KNET / Card) + provider. Defaults to **COD-only**
  so the store is deployable before the client's gateway key exists.
- **Server-only secret store** — new `payment_settings` table (migration `0003`,
  RLS admin-only, no public read) holds the gateway API key. **Verified the key
  is NOT readable via the anon key.** The public config carries only booleans.
- **Admin → Payments** page: toggle online payment, choose methods, select
  provider (KNET/MyFatoorah), test-mode, and paste the secret key (write-only,
  "key on file" indicator).
- Checkout renders only the **available** methods (resolved server-side from
  config + key presence); `placeOrder` rejects a disabled method server-side.
- Kept a clean `resolveCheckoutMethods` / `isOnlineReady` abstraction so a real
  gateway integration drops in later.
- Verified in-browser + DB: default checkout = COD-only; enabling online + KNET +
  a test key made KNET appear at checkout; reverted to the safe COD-only default.
- Fixed a hydration mismatch in the new PDP `ShareRow` (URL now resolved after
  mount).

### Added — Test suite & CI
- **Vitest** unit suite (`tests/`, `npm test`) — 42 tests across the mock catalog
  repository (filter/sort/paginate/lookup/collections), `formatPrice`/`t`,
  listing search-params, checkout schema + shipping rules, config helpers, and the
  cart store. Framework-agnostic; no network/Supabase needed.
- **GitHub Actions CI** (`.github/workflows/ci.yml`): typecheck → tests → hermetic
  build (mock data + local config, no secrets) on push/PR.
- Added a small in-memory `localStorage` polyfill for tests (`tests/setup.ts`).

### Added — Collections, Offers, live search, PDP share
- **Collections**: admin CRUD with a product picker (localized title/subtitle,
  banner) + storefront `/collections/[slug]` (banner hero + product grid).
- **Offers/Sale page** `/offers` (on-sale products with sort + pagination); the
  "Sale" nav item now points there.
- **Live-search typeahead**: `/api/search` route + header `SearchBox` with a
  debounced product-suggestion dropdown (feature-flagged via `features.liveSearch`,
  falls back to a plain search form).
- **PDP social share row** (X, Facebook, WhatsApp, Pinterest, copy-link).
- Verified in-browser + DB: live-search dropdown (4 results for "shirt"), Offers
  page (Satan Shirt KD17→KD10), collection created bilingually via admin ("The
  Summer Edit" / "تشكيلة الصيف", 2 products) rendering at `/collections/summer-edit`,
  and the PDP share row. No errors.

### Added — Admin: config, homepage builder, CMS, customers (M3 cont.)
- **Settings / remote-config editor**: brand name (AR/EN), palette (primary/accent/
  background/foreground with color pickers) and feature flags, persisted to
  `app_config`. Storefront switched to `NEXT_PUBLIC_CONFIG_SOURCE=remote`, so edits
  apply store-wide with no redeploy. (Re-seeded `app_config` first so remote config
  carries the current premium palette.)
- **Homepage builder**: reorder + enable/disable homepage sections → `app_config.homeSections`
  → rendered by the storefront page-builder.
- **CMS pages**: admin CRUD (localized title + HTML body, publish toggle) +
  storefront route `/pages/[slug]` (RLS: published only). Fixed footer links from
  `/p/*` (collided with products) to `/pages/*`.
- **Customers management**: list with order counts + admin role toggle.
- New admin services/actions: `config-service`, `config-actions`, plus `cms` read
  service; all writes gated by `assertAdmin()`.
- Verified in-browser + DB: primary color edit propagated to the live storefront
  (`#1D4ED8`), section toggle removed the promo banner, CMS "About" page renders
  bilingually at `/pages/about`, and a customer role toggle persisted. No errors.

### Added — Admin Dashboard (M3, initial)
- **Role-gated `/admin`** (`is_admin` via `customers.role`) with standalone chrome
  (storefront header/footer skipped on admin routes via an `x-pathname` header set
  in middleware). Admin link surfaces in the account nav for admins.
- **Dashboard**: live stats (revenue, orders, pending, products, customers).
- **Products CRUD**: create/edit/delete with a bilingual `LocalizedField` (AR/EN
  tabs + untranslated indicator), brand/category selects, image URL, KD price
  (converted to minor units), availability. Verified round-trip: admin-created
  product appears on its storefront PDP + category listing.
- **Categories CRUD**: add/edit/delete, parent, sort order, visibility.
- **Orders management**: list + detail with status + tracking updates (revalidates
  and feeds dashboard revenue).
- Admin reads/writes go through a service-role client behind `assertAdmin()`
  authorization (`src/core/admin/*`).
- Created an admin user (`admin@thouqi.com`) for testing; auth email auto-confirm
  already enabled.
- Fix: auth creds schema rejected empty `fullName` on sign-in (blocked login).

### Added — Auth, account & order persistence (M2b)
- **Auth**: register / sign in / sign out via Supabase (server actions), with a
  combined **next-intl + Supabase session middleware** (`updateSession`) that
  refreshes auth cookies on every request. Email auto-confirm enabled on the
  project (no SMTP needed for now). Header reflects auth state.
- **Account** (protected, redirects to `/login`): overview + editable profile,
  orders list, order detail (items, total, shipping address, status badge),
  and addresses CRUD — all RLS owner-scoped.
- **Order persistence**: `placeOrder` now delegates to an orders service that
  **re-prices server-side from the catalog**, persists `orders` + `order_items`
  via the service-role client (orders have no public INSERT policy by design),
  links the signed-in customer, and returns a `TQ-…` reference. Added the
  `reference` column (migration `0002`).
- Robustness: `SupabaseCatalogRepository.listProductsByIds` ignores non-UUID ids
  (defends against stale cart lines).
- Verified in-browser: register → session → profile (via `handle_new_user`) →
  add to bag → checkout → order persisted with `customer_id` (confirmed in DB) →
  visible in RLS-scoped account orders + detail → sign out → route protection.

### Added — Live Supabase backend
- Applied `0001_init.sql` to the project via the Management API (17 tables, RLS
  on all, 30 policies, `on_auth_user_created` trigger). Fixed an ordering bug:
  `is_admin()` is now plpgsql so it resolves `customers` at run time.
- `scripts/migrate.mjs` now splits SQL into statements (respecting `$$` function
  bodies) and batches them with retry — robust against gateway timeouts.
- `scripts/seed.ts` maps human-readable ids → deterministic UUIDv5 across all
  references, so the seed is idempotent and relationship-safe. Seeded brands,
  categories, products, images, variants, collections, banners, and app_config.
- Implemented `SupabaseCatalogRepository` (anon key, RLS-guarded; snake_case +
  JSONB rows mapped to domain types). Set `DATA_SOURCE=supabase`.
- Verified: home, listing (with brand facets + filtering), and PDP all render
  from live Supabase data with no server errors.

### Changed — Premium UI overhaul
- Typography: display face upgraded to **Bodoni Moda** (high-contrast editorial
  serif) for logo + headings.
- Palette refined to a premium warm identity: ivory background, deep burgundy
  primary, warm neutrals, plus a static champagne `--color-gold` hairline accent;
  radius tightened. Config defaults synced so remote theming stays in step.
- New primitives: `Button`/`buttonClass`, `AnnouncementBar`, and a
  `Reveal` fade-up-on-scroll wrapper (respects `prefers-reduced-motion`).
- Header: sticky translucent backdrop, announcement bar, elegant underline
  search, icon actions, and a full-width mega-nav with animated underlines and a
  fade/lift panel.
- Hero: cinematic full-bleed with gradient scrim, serif headline, slow zoom.
- Product cards: hover image zoom, quick-add overlay, wishlist reveal, refined
  type. Category tiles + promo banner made editorial/cinematic.
- PDP Add to Bag restyled dark→burgundy for palette cohesion.
- Migration tooling: `scripts/migrate.mjs` (`npm run migrate`) applies SQL via
  the Supabase Management API (token only, no DB password).
- Verified in-browser (AR + EN): home, PDP, mega-menu, and the full add-to-bag →
  drawer flow render correctly with no console/runtime errors.

### Added — M2 Commerce (cart / wishlist / checkout)
- Cart: slide-over `CartDrawer` (opens on add-to-bag / header bag button, RTL-aware,
  Escape-to-close, scroll-lock), full `/cart` page, quantity steppers, live header
  count badge, persisted store shared across both.
- Wishlist: persisted store, `/wishlist` page, heart toggles wired into product
  cards and the PDP, plus move-to-bag.
- Checkout: single-page `/checkout` (contact, shipping address, shipping method,
  payment) with a Zod-validated `placeOrder` **Server Action** that computes
  totals server-side and returns an order number; success clears the cart and
  shows an order-confirmation screen.
- Client/server boundary hardening: client components read assets from
  `config/assets.config` (leaf) instead of the server-only `@/config` barrel.
- Verified in-browser (AR + EN): add-to-bag → drawer + badge + persistence;
  full checkout → order `TQ-…` + cart cleared; wishlist toggle → page render.
  No console/runtime errors.

### Added — M1 Catalog browsing
- Category listing route `/[locale]/c/[...slug]`: link-based filter sidebar
  (category tree + brand facets), URL-driven sort/per-page, crawlable pagination,
  breadcrumbs, empty state.
- Product Details route `/[locale]/p/[slug]`: thumbnail gallery, variant selector
  with stock handling, Details/Size & Fit/Delivery accordions, related products,
  and `Product` JSON-LD structured data.
- Search route `/[locale]/search` with query preserved across sort/pagination
  (noindexed).
- Persisted client cart store (Zustand) + functional "Add to Bag" and a live
  header cart-count badge.
- SEO: multilingual `sitemap.ts` with `hreflang` alternates, `robots.ts`,
  per-page canonical + language alternates helper (`lib/seo.ts`).
- Verified: all routes build + render in AR (RTL) and EN; brand filtering and
  search return correct results; no runtime errors.

### Added — M0 Foundation
- Next.js 15 (App Router, RSC) + TypeScript (strict) + Tailwind v4 scaffold.
- Configuration system: typed `SiteConfig`, local defaults, remote deep-merge
  override, feature flags, and an asset registry.
- Design-token theming via CSS variables (`ThemeStyle`) — no hardcoded colors.
- Internationalization: Arabic (default) + English, RTL/LTR, locale-prefixed
  routes, ICU message catalogs, locale-aware navigation + middleware.
- Backend-agnostic data layer: catalog domain types, repository interface,
  service layer, mock in-memory repository, Supabase repo scaffold, DI factory.
- Storefront shell: config-driven header with CSS-only mega nav, footer with
  newsletter/socials, language switcher.
- Homepage page-builder: ordered/toggleable sections (hero, product rail,
  category grid, promo banner) rendered from config.
- Product card with sale handling and KWD (3-digit) price formatting.
- Database schema + RLS policies (`supabase/migrations/0001_init.sql`).
- Documentation: README, architecture, configuration, i18n, database,
  deployment, roadmap, TODO, and ADRs 0001–0003.

### Verified
- Production build passes; `/ar` and `/en` prerender.
- Rendered output confirmed: correct `lang`/`dir`, localized nav + currency,
  product data, and KWD formatting for both locales.
