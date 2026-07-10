import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { LocalizedText } from "@/config/types";

/**
 * Storefront CMS reads. Uses the anon key; RLS only exposes published pages.
 */
export interface CmsPage {
  slug: string;
  title: LocalizedText;
  body: LocalizedText;
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function getPublishedPage(slug: string): Promise<CmsPage | null> {
  const { data, error } = await db()
    .from("cms_pages")
    .select("slug, title, body")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return {
    slug: data.slug as string,
    title: data.title as LocalizedText,
    body: (data.body as LocalizedText) ?? {},
  };
}
