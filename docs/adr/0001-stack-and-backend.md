# ADR 0001 — Stack & backend choice

- Status: Accepted
- Date: 2026-07-08

## Context

We need a premium, scalable, multilingual e-commerce platform reusable across
future clients. The client provisioned **both Firebase and Supabase**. The
domain is relational (products, variants, categories, orders, order items,
reviews) and requires server-side rendering for SEO and performance.

## Decision

- **Framework: Next.js 15 (App Router, RSC) + TypeScript (strict).** Best-in-class
  SEO/SSR, streaming, edge middleware (needed for i18n locale routing), mature
  ecosystem, and Server Components minimize client JS.
- **Backend: Supabase (PostgreSQL + Auth + Storage + Edge Functions).** The
  catalog/order model is inherently relational; Postgres gives us joins,
  constraints, and RLS for security. Firestore's document model would force
  denormalization and awkward querying for filters/sorting.
- **Firebase: analytics only (optional GA4).** Not used for data or auth.
- **Styling: Tailwind v4 with CSS-variable design tokens.** Enables remote
  re-theming without code changes.

## Consequences

- One relational schema, RLS-secured, seedable from canonical mock data.
- The frontend is decoupled from Supabase via a repository interface (ADR 0002),
  so this choice is reversible.
- Firebase credentials remain available but unused beyond analytics.
