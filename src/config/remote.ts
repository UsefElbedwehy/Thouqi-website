import "server-only";
import type { SiteConfig } from "./types";

/**
 * Fetches the remote configuration override from Supabase (`app_config` table,
 * single row keyed by environment). Returns a partial SiteConfig that is
 * deep-merged over the defaults, or null when unavailable.
 *
 * NOTE: The `app_config` table + RLS ship in the DB migrations. Until then this
 * returns null so the app cleanly falls back to `defaultSiteConfig`.
 */
export async function fetchRemoteConfig(): Promise<Partial<SiteConfig> | null> {
  try {
    const { createSupabaseAdminClient } = await import("@/data/supabase/server");
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("app_config")
      .select("config")
      .eq("key", "default")
      .maybeSingle();

    if (error || !data) return null;
    return data.config as Partial<SiteConfig>;
  } catch {
    return null;
  }
}
