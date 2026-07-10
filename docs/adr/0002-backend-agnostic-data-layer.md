# ADR 0002 — Backend-agnostic data layer

- Status: Accepted
- Date: 2026-07-08

## Context

The client wants the ability to replace Supabase with another backend later, and
the platform to be reusable for future businesses. Components calling Supabase
directly would make that impossible and couple UI to storage schema.

## Decision

Introduce explicit layers with interface boundaries:

```
UI → Service (core/<domain>/service.ts)
   → Repository interface (core/<domain>/repository.ts)
   → Implementation (data/mock | data/supabase)  ← chosen by DI in data/index.ts
   → Supabase
```

- The UI and services depend **only on the repository interface**.
- `data/index.ts` selects the implementation from `DATA_SOURCE`.
- Domain types (`core/<domain>/types.ts`) are canonical; repositories map raw
  rows into them, so storage schema never leaks upward.
- A `MockCatalogRepository` provides a fully working, infra-free dataset.

## Consequences

- Swapping backends = write one repository implementation; no UI/service edits.
- The storefront runs and is testable with zero infrastructure (mock source).
- Slight indirection overhead — justified by testability and replaceability.
- Localized content is modeled as `LocalizedText` maps end-to-end (ADR 0003).
