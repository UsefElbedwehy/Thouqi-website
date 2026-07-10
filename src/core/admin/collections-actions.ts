"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/data/supabase/server";
import { assertAdmin } from "./guard";

export interface AdminActionResult {
  ok: boolean;
  id?: string;
  error?: string;
}

const collectionSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  subtitleEn: z.string().optional().or(z.literal("")),
  subtitleAr: z.string().optional().or(z.literal("")),
  bannerImage: z.string().url().optional().or(z.literal("")),
  productIds: z.array(z.string().uuid()).default([]),
});

/** Create/edit a collection and (re)assign its products. */
export async function saveCollectionAction(raw: unknown): Promise<AdminActionResult> {
  await assertAdmin();
  const parsed = collectionSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };
  const d = parsed.data;
  const db = createSupabaseAdminClient();

  const row = {
    slug: d.slug,
    title: { en: d.titleEn, ar: d.titleAr },
    subtitle: d.subtitleEn || d.subtitleAr ? { en: d.subtitleEn, ar: d.subtitleAr } : null,
    banner_image: d.bannerImage || null,
  };

  let id = d.id;
  if (id) {
    const { error } = await db.from("collections").update(row).eq("id", id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await db.from("collections").insert(row).select("id").single();
    if (error) return { ok: false, error: error.message };
    id = data.id as string;
  }

  // Replace product assignments.
  await db.from("collection_products").delete().eq("collection_id", id);
  if (d.productIds.length) {
    await db.from("collection_products").insert(
      d.productIds.map((pid, i) => ({ collection_id: id, product_id: pid, sort_order: i })),
    );
  }

  revalidatePath("/admin/collections");
  revalidatePath(`/collections/${d.slug}`);
  return { ok: true, id };
}

export async function deleteCollectionAction(id: string): Promise<AdminActionResult> {
  await assertAdmin();
  const db = createSupabaseAdminClient();
  const { error } = await db.from("collections").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/collections");
  return { ok: true };
}
