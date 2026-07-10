# ADR 0003 — i18n strategy & localized content model

- Status: Accepted
- Date: 2026-07-08

## Context

The platform must be multilingual from day one (Arabic default + English), fully
RTL/LTR, and able to add languages (French, Turkish, …) **without architectural
changes**. Both UI strings and dynamic content (product names, CMS, nav) must be
localized, and content is edited per-language in the dashboard.

## Decision

- **Routing/UI: `next-intl`** with locale-prefixed URLs (`/ar`, `/en`),
  `localePrefix: "always"` for SEO, and RSC-first message loading. ICU message
  catalogs in `messages/<code>.json`. No hardcoded UI strings.
- **Direction**: derived from a locale metadata registry (`config/locales.ts`),
  applied to `<html dir>`. Layout uses **CSS logical properties** so the UI
  mirrors automatically — no per-component RTL branches.
- **Localized content**: modeled as `LocalizedText = Record<locale, string>`
  everywhere (domain types, DB as JSONB). `t(text, locale)` resolves with
  fallback. This means **adding a language never alters the schema or types**.
- **Fonts** switch by script (Arabic: IBM Plex Sans Arabic; Latin: Inter),
  configurable via theme.

## Consequences

- Adding a language = add locale code + metadata + a message catalog + provide
  content values. Zero component/schema changes.
- JSONB localized columns trade some query ergonomics for flexibility — an
  acceptable tradeoff given the "any number of languages" requirement.
- `hreflang` + localized structured data are queued in the roadmap (M1).
