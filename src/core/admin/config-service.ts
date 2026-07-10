import "server-only";
import { createSupabaseAdminClient } from "@/data/supabase/server";
import { defaultSiteConfig } from "@/config/site.config";
import type { SiteConfig } from "@/config/types";

/**
 * Admin read/write for the remote site configuration (`app_config.config`).
 * This is what powers the "configurable without code" promise: the Settings and
 * Homepage-builder screens edit this record, and the storefront reads it when
 * NEXT_PUBLIC_CONFIG_SOURCE=remote.
 */

const KEY = "default";

/** Full effective config stored remotely, falling back to the seeded default. */
export async function readAdminConfig(): Promise<SiteConfig> {
  const db = createSupabaseAdminClient();
  const { data } = await db.from("app_config").select("config").eq("key", KEY).maybeSingle();
  const stored = data?.config as Partial<SiteConfig> | undefined;
  return { ...defaultSiteConfig, ...(stored ?? {}) } as SiteConfig;
}

/** Persist a full config object back to `app_config` (upsert). */
export async function writeAdminConfig(config: SiteConfig): Promise<void> {
  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("app_config")
    .upsert({ key: KEY, config }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}
