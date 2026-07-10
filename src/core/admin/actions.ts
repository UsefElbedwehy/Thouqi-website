"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/data/supabase/server";
import { assertAdmin } from "./guard";

/** KD (decimal string) → integer minor units (KWD has 3 fraction digits). */
function toMinor(kd: string | number): number {
  const n = typeof kd === "number" ? kd : parseFloat(kd);
  return Math.round((Number.isFinite(n) ? n : 0) * 1000);
}

const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "lowercase, digits, hyphens"),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  descEn: z.string().optional().default(""),
  descAr: z.string().optional().default(""),
  brandId: z.string().uuid().optional().or(z.literal("")),
  price: z.string().min(1),
  compareAtPrice: z.string().optional().or(z.literal("")),
  available: z.boolean().default(true),
  imageUrl: z.string().refine((v) => v === "" || /^(https?:\/\/|\/)/.test(v), "must be a URL or path").optional().or(z.literal("")),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  // Size variants offered, each with its own stock count. Empty = one-size (no size selection).
  variants: z
    .array(z.object({ size: z.string().min(1), inventory: z.coerce.number().int().nonnegative() }))
    .optional()
    .default([]),
});

export interface AdminActionResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/** Create or update a product (+ primary image and category link). */
export async function saveProductAction(raw: unknown): Promise<AdminActionResult> {
  await assertAdmin();
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };
  const d = parsed.data;
  const db = createSupabaseAdminClient();

  const row = {
    slug: d.slug,
    name: { en: d.nameEn, ar: d.nameAr },
    description: { en: d.descEn, ar: d.descAr },
    brand_id: d.brandId || null,
    price: toMinor(d.price),
    compare_at_price: d.compareAtPrice ? toMinor(d.compareAtPrice) : null,
    available: d.available,
  };

  let productId = d.id;
  if (productId) {
    const { error } = await db.from("products").update(row).eq("id", productId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await db.from("products").insert(row).select("id").single();
    if (error) return { ok: false, error: error.message };
    productId = data.id as string;
  }

  // Primary image: replace the existing first image.
  if (d.imageUrl) {
    await db.from("product_images").delete().eq("product_id", productId).eq("sort_order", 0);
    await db.from("product_images").insert({
      product_id: productId,
      url: d.imageUrl,
      alt: { en: d.nameEn, ar: d.nameAr },
      sort_order: 0,
    });
  }

  // Category link: replace with the single selected category.
  if (d.categoryId) {
    await db.from("product_categories").delete().eq("product_id", productId);
    await db.from("product_categories").insert({ product_id: productId, category_id: d.categoryId });
  }

  // Size variants: sync to the selected sizes, keyed by SKU so unchanged sizes
  // keep their variant id (order_items.variant_id references it). Requiring a
  // size at checkout is driven by whether any variants exist.
  const keepSkus = d.variants.map((v) => `${d.slug}-${v.size}`.toLowerCase());
  if (keepSkus.length) {
    await db
      .from("product_variants")
      .delete()
      .eq("product_id", productId)
      .not("sku", "in", `(${keepSkus.join(",")})`);
    await db.from("product_variants").upsert(
      d.variants.map((v) => ({
        product_id: productId,
        sku: `${d.slug}-${v.size}`.toLowerCase(),
        options: { size: v.size },
        price: toMinor(d.price),
        compare_at_price: d.compareAtPrice ? toMinor(d.compareAtPrice) : null,
        inventory: v.inventory,
      })),
      { onConflict: "sku" },
    );
  } else {
    await db.from("product_variants").delete().eq("product_id", productId);
  }

  revalidatePath("/admin/products");
  return { ok: true, id: productId };
}

export async function deleteProductAction(id: string): Promise<AdminActionResult> {
  await assertAdmin();
  const db = createSupabaseAdminClient();
  const { error } = await db.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/products");
  return { ok: true };
}

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  parentId: z.string().uuid().optional().or(z.literal("")),
  order: z.coerce.number().int().default(0),
  visible: z.boolean().default(true),
  imageUrl: z.string().refine((v) => v === "" || /^(https?:\/\/|\/)/.test(v), "must be a URL or path").optional().or(z.literal("")),
});

export async function saveCategoryAction(raw: unknown): Promise<AdminActionResult> {
  await assertAdmin();
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };
  const d = parsed.data;
  const db = createSupabaseAdminClient();
  const row = {
    slug: d.slug,
    name: { en: d.nameEn, ar: d.nameAr },
    parent_id: d.parentId || null,
    sort_order: d.order,
    visible: d.visible,
    image_url: d.imageUrl || null,
  };
  if (d.id) {
    const { error } = await db.from("categories").update(row).eq("id", d.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await db.from("categories").insert(row);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategoryAction(id: string): Promise<AdminActionResult> {
  await assertAdmin();
  const db = createSupabaseAdminClient();
  const { error } = await db.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/categories");
  return { ok: true };
}

const orderUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled", "refunded"]),
  trackingNumber: z.string().optional().or(z.literal("")),
});

export async function updateOrderAction(raw: unknown): Promise<AdminActionResult> {
  await assertAdmin();
  const parsed = orderUpdateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const d = parsed.data;
  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("orders")
    .update({ status: d.status, tracking_number: d.trackingNumber || null })
    .eq("id", d.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/orders/${d.id}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}
