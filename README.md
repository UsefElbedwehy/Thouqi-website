# THOUQi Platform

A **premium, configurable, multilingual e-commerce platform**. Built as a
reusable commercial-grade storefront + admin foundation that can be re-skinned
for future clients with minimal effort — inspired by (not a clone of)
[thouqi.com](https://www.thouqi.com).

> Status: **Foundation / MVP scaffold.** Storefront shell, config system, i18n
> (AR/EN + RTL), design tokens, and a backend-agnostic data layer are in place
> and building. See [`docs/ROADMAP.md`](docs/ROADMAP.md) for what's next.

---

## Highlights

- **Next.js 15 (App Router) + TypeScript + Tailwind v4**, React Server Components.
- **Fully configurable** — branding, colors, typography, navigation, homepage
  layout, feature flags and assets come from a config system that can be
  overridden remotely (Supabase) with **no code changes**. See
  [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md).
- **Multilingual from day one** — Arabic (default) + English, automatic RTL/LTR,
  locale-prefixed SEO URLs, all strings from message catalogs + DB-localized
  content. Adding a language is config-only.
- **Backend-agnostic** — UI → service → repository → Supabase. Components never
  touch Supabase directly, so the backend is swappable. See
  [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
- **Design tokens** — deep-red/white identity driven entirely by CSS variables;
  no hardcoded colors.

## Quick start

```bash
cp .env.example .env.local   # fill in Supabase keys (already provided for dev)
npm install
npm run dev                  # http://localhost:3000  → redirects to /ar
```

The app runs with `DATA_SOURCE=mock` by default (in-memory seed data), so **no
database is required** to develop the storefront.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Run the Vitest unit suite |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Run the Playwright e2e suite (needs a live Supabase in `.env.local`) |
| `npm run migrate` | Apply SQL migrations via the Supabase Management API |
| `npm run seed` | Seed Supabase from the canonical mock data |

## Testing & CI

Unit tests (Vitest) live in `tests/` and cover framework-agnostic domain logic —
the mock catalog repository (filter/sort/paginate/lookup), formatters, listing
URL params, checkout/shipping rules, config helpers and the cart/wishlist stores.
They need no network or Supabase: `npm test`. GitHub Actions
(`.github/workflows/ci.yml`) runs lint → typecheck → tests → a hermetic build
(mock data, local config) on every push and PR.

e2e tests (Playwright) live in `e2e/` and cover the two critical paths — browse
→ add to bag → checkout, and admin sign-in → create/edit/delete a product. Unlike
the unit suite, these are **integration tests against the real Supabase project**
in `.env.local` (not the hermetic mock build), so they're intentionally **not**
part of the CI job — run them locally/against staging with `npm run test:e2e`
(boots `next dev` itself, or point at a running server via `E2E_BASE_URL`). The
admin test creates and deletes its own ephemeral product per run, so it's safe
to re-run without accumulating test data. Override credentials with
`E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` if needed.

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — layers, data flow, module boundaries
- [Configuration](docs/CONFIGURATION.md) — the config & assets system
- [Internationalization](docs/I18N.md) — locales, RTL, localized content
- [Database](docs/DATABASE.md) — schema design
- [Deployment](docs/DEPLOYMENT.md) — local, prod, CI/CD
- [Roadmap](docs/ROADMAP.md) & [Changelog](CHANGELOG.md)
- [ADRs](docs/adr/) — architecture decision records

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 15 App Router | RSC, streaming, SEO, edge-ready |
| Language | TypeScript (strict) | Safety across a large codebase |
| Styling | Tailwind v4 + CSS-var tokens | Remote-themeable, no hardcoded design |
| i18n | next-intl | RSC-first, RTL, ICU messages |
| Backend | Supabase (Postgres/Auth/Storage) | Relational catalog, RLS, storage |
| State | Zustand | Minimal client state (cart) |
| Validation | Zod | Runtime-safe boundaries |
