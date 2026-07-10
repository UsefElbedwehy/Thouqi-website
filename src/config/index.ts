import { cache } from "react";
import type { SiteConfig } from "./types";
import { defaultSiteConfig } from "./site.config";
import { defaultAssets, type AssetRegistry } from "./assets.config";

/**
 * Config resolution.
 *
 * `getSiteConfig()` returns the effective configuration for the current
 * request. Source is controlled by NEXT_PUBLIC_CONFIG_SOURCE:
 *   - "local"  → use the seeded default config (dev / no backend).
 *   - "remote" → deep-merge the default with the `app_config` record from
 *                Supabase so ops can rebrand without a redeploy.
 *
 * Wrapped in React `cache()` so it is resolved once per request.
 */
export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  const source = process.env.NEXT_PUBLIC_CONFIG_SOURCE ?? "local";

  if (source !== "remote") {
    return defaultSiteConfig;
  }

  try {
    // Lazy import keeps the Supabase client out of the bundle when unused.
    const { fetchRemoteConfig } = await import("./remote");
    const remote = await fetchRemoteConfig();
    return remote ? deepMerge(defaultSiteConfig, remote) : defaultSiteConfig;
  } catch (err) {
    // Never let a config fetch failure take down the storefront.
    console.error("[config] remote fetch failed, using defaults:", err);
    return defaultSiteConfig;
  }
});

export function getAssets(): AssetRegistry {
  return defaultAssets;
}

/** Enabled homepage sections, ordered. */
export function orderedHomeSections(config: SiteConfig) {
  return [...config.homeSections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);
}

/** Shallow-typed deep merge (objects merge, arrays/scalars replace). */
function deepMerge<T>(base: T, override: Partial<T>): T {
  if (override === null || override === undefined) return base;
  if (Array.isArray(override)) return override as unknown as T;
  if (typeof base !== "object" || base === null) return override as T;

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    const baseValue = (base as Record<string, unknown>)[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      baseValue &&
      typeof baseValue === "object" &&
      !Array.isArray(baseValue)
    ) {
      result[key] = deepMerge(baseValue, value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

export type { SiteConfig } from "./types";
export { defaultSiteConfig } from "./site.config";
