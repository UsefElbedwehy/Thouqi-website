# Architecture

## Goals

Scalability, maintainability, performance, security, accessibility, SEO,
configurability and developer experience — in that spirit, the codebase is
organized so that **presentation, business logic and persistence are cleanly
separated** and the backend is replaceable.

## Layered data flow

The frontend never talks to Supabase directly. Data flows through explicit
layers, each depending only on the one below via an interface:

```
 React Server Components / Route Handlers / Server Actions   (presentation)
                          │  calls
                          ▼
                    Service layer          src/core/<domain>/service.ts
                          │  depends on Repository *interface*
                          ▼
                  Repository interface      src/core/<domain>/repository.ts
                          │  implemented by
                          ▼
         Mock repo   |   Supabase repo      src/data/**
                          │
                          ▼
                 Supabase (Postgres/Storage/Auth)
```

- **Presentation** — Server Components fetch via services; Client Components
  handle interactivity (cart, language switch) and hold minimal state.
- **Service layer** (`src/core/<domain>/service.ts`) — the application boundary.
  Business rules, section sourcing, caching policy. Backend-agnostic, testable.
- **Repository interface** (`src/core/<domain>/repository.ts`) — the contract.
  Everything above depends only on this.
- **Data layer** (`src/data`) — concrete repositories. `src/data/index.ts` is
  the dependency-injection point that picks the implementation from
  `DATA_SOURCE` (`mock` | `supabase`). **Swapping the backend is a one-line
  change here.**

### Why this matters

Supabase can be replaced by any backend (custom REST/GraphQL, another BaaS) by
writing one new repository implementation. No service, component, or page
changes. The mock repository also means the entire storefront runs and is
testable with **zero infrastructure**.

## Module organization (feature-first)

```
src/
  app/                 Next.js App Router (routing + pages only)
    [locale]/          Locale-scoped routes (RTL/LTR aware)
  components/          UI, grouped by concern (layout, catalog, home, ui)
  config/              Configuration system (types, defaults, remote merge)
  core/                Domain: types, repository contracts, services
    catalog/           Products, categories, collections, banners
  data/                Repository implementations + DI factory
    mock/              In-memory seed data + repo
    supabase/          Supabase clients + repos
  i18n/                Locale routing, navigation, request config
  lib/                 Cross-cutting helpers (format, utils)
  messages/            ICU message catalogs (see /messages at root)
```

New domains (cart, orders, customers, cms) follow the same shape: a `core/<x>`
with types + repository + service, and a `data/**` implementation.

## Rendering & performance

- **RSC-first**: data fetching happens on the server; almost no JS ships for
  content. Client Components are limited to genuinely interactive islands.
- **`generateStaticParams`** prerenders locale roots; product/category pages use
  streaming SSR with caching.
- **`next/image`** for responsive, optimized media (Supabase Storage + CDNs
  configured in `next.config.ts`).
- Config resolution is wrapped in React `cache()` (resolved once per request).

## Security

- **RLS everywhere**: the anon key is safe in the browser; all access is
  governed by Row Level Security policies (see `docs/DATABASE.md`).
- The **service-role key is server-only** (`src/data/supabase/server.ts`,
  `createSupabaseAdminClient`) and never imported into client bundles
  (`server-only` guard).
- Input validated with **Zod** at trust boundaries (forms, route handlers).

## Cross-cutting decisions

Recorded as ADRs in [`docs/adr/`](adr/). Start there to understand *why* the
stack looks the way it does.
