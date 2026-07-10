# Deployment

## Local development

```bash
cp .env.example .env.local     # dev Supabase keys are pre-filled
npm install
npm run dev                    # http://localhost:3000 → /ar
```

Runs with `DATA_SOURCE=mock` (in-memory seed) — **no database needed** to work
on the storefront. Set `DATA_SOURCE=supabase` once the DB is seeded.

### Environment variables

| Var | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Anon/publishable key (RLS-guarded) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Admin/service ops (bypasses RLS) |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical URL (SEO, OG, hreflang) |
| `NEXT_PUBLIC_CONFIG_SOURCE` | public | `local` \| `remote` |
| `DATA_SOURCE` | server | `mock` \| `supabase` |
| `NEXT_PUBLIC_IMAGE_HOSTS` | public | Extra image CDN hostnames (CSV) |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | public | Optional GA4 |

## Database

```bash
# Supabase CLI
supabase link --project-ref <ref>
supabase db push                 # applies supabase/migrations/*
npm run seed                     # loads canonical catalog data
```

Or paste `supabase/migrations/0001_init.sql` into the Supabase SQL editor.

### Storage

Create public buckets `product-images`, `brand-logos`, `banners`, `cms`. Add the
bucket domain to `NEXT_PUBLIC_IMAGE_HOSTS` if not on `*.supabase.co`.

## Production (frontend)

Recommended: **Vercel** (first-class Next.js support, edge middleware, image
optimization).

1. Import the repo; framework auto-detected.
2. Add all env vars (mark server-only ones as non-public).
3. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
4. Consider `NEXT_PUBLIC_CONFIG_SOURCE=remote` + `DATA_SOURCE=supabase`.
5. Deploy. Configure the custom domain; SSL is automatic.

### Docker (alternative)

A `Dockerfile` using the Next.js `standalone` output can target any container
host (Fly.io, Render, ECS). Tracked in the roadmap (M4).

## CI/CD (planned, M4)

- PR checks: `typecheck`, `lint`, `build`, unit + Playwright e2e.
- Preview deploy per PR; promote to production on merge to `main`.
- DB migrations applied via `supabase db push` in the pipeline.

## Post-deploy checklist

- [ ] `/ar` and `/en` load; language switch preserves path
- [ ] RTL renders correctly for Arabic
- [ ] Product images load (Storage host allow-listed)
- [ ] `robots.txt` / sitemap reachable (M1)
- [ ] Analytics firing (if enabled)
