# Configuration System

Everything that reasonably *can* be configurable **is** — and nothing visual is
hardcoded in components. The storefront's identity, content structure and
behaviour are driven by a single `SiteConfig` object.

## Sources & precedence

`getSiteConfig()` (`src/config/index.ts`) resolves the effective config:

1. **Defaults** — `src/config/site.config.ts` (`defaultSiteConfig`). The seed,
   used for local dev and as the fallback.
2. **Remote override** — when `NEXT_PUBLIC_CONFIG_SOURCE=remote`, the
   `app_config` record from Supabase is **deep-merged over** the defaults, so
   ops/marketing can rebrand and re-lay-out the site **without a code change or
   redeploy**. A failed fetch silently falls back to defaults.

## What's configurable

| Area | Where | Notes |
| --- | --- | --- |
| Site name, tagline, logo, favicon | `SiteConfig` | Localized |
| Brand **colors**, radius | `theme.colors` | → CSS variables at runtime |
| **Typography** | `theme.typography` | Font stacks per script |
| Currency, symbol, fraction digits, country | `commerce` | KWD = 3 digits |
| Contact info, social links | `contact`, `social` | |
| **Navigation** + mega menus | `navigation` | Localized, nested columns |
| **Homepage** sections | `homeSections` | Ordered, toggleable, per-type settings |
| **Feature flags** | `features` | wishlist, reviews, blog, … |
| **Assets** | `src/config/assets.config.ts` | placeholders, empty states |

## Theming without code changes

`<ThemeStyle>` (`src/components/theme/ThemeStyle.tsx`) writes the config's colors
into CSS variables (`--color-primary`, …) at request time. Components only ever
reference tokens (`bg-primary`, `text-foreground`), so changing a color in the
backend re-themes the entire UI. No hardcoded hex values in components — ever.

## Homepage as a page-builder

`homeSections` is an ordered list of toggleable sections, each with a `type`
and free-form `settings`:

```ts
{ id: "just-in", type: "productRail", enabled: true, order: 2,
  settings: { titleKey: "home.justIn", source: "newest", limit: 12 } }
```

`HomeSections` renders them in order, dispatching on `type`. Section types today:
`hero`, `productRail`, `categoryGrid`, `promoBanner`, `collectionShowcase`.
Adding a type = add a component + a `case`; **reordering/enabling/disabling is
pure data** and will be editable from the admin dashboard.

## Adding a new config field

1. Add it to the relevant interface in `src/config/types.ts`.
2. Give it a default in `site.config.ts`.
3. Consume it via `getSiteConfig()` — it's automatically remote-overridable.
