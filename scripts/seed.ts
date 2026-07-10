/**
 * Seed Supabase from the canonical mock catalog data.
 *
 * Keeps the mock dataset (used for local dev) and the live database identical.
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in the env
 * (loaded from .env.local). Run with: `npm run seed`.
 *
 * Idempotent: upserts by slug/id so re-running is safe.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import {
  brands,
  categories,
  products,
  collections,
  banners,
} from "../src/data/mock/catalog.data";
import { defaultSiteConfig } from "../src/config/site.config";
import { defaultAssets } from "../src/config/assets.config";

// Minimal .env.local loader (avoids adding a dependency).
function loadEnv() {
  try {
    const file = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of file.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    /* ignore — env may already be set */
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

/**
 * Deterministic UUID (v5-style) from a stable string id. The catalog seed uses
 * human-readable ids ("b-rue15"); the DB uses uuid PKs. Mapping every id +
 * reference through this keeps relationships intact and makes the seed
 * idempotent (same input → same uuid on every run).
 */
const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"; // RFC-4122 URL namespace
function uuid(name: string): string {
  const nsBytes = Buffer.from(NAMESPACE.replace(/-/g, ""), "hex");
  const hash = createHash("sha1").update(nsBytes).update(name, "utf8").digest();
  const b = hash.subarray(0, 16);
  b[6] = (b[6] & 0x0f) | 0x50; // version 5
  b[8] = (b[8] & 0x3f) | 0x80; // variant
  const hex = b.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function upsert(table: string, rows: Record<string, unknown>[], onConflict = "id") {
  if (!rows.length) return;
  const { error } = await db.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`[${table}] ${error.message}`);
  console.log(`✓ ${table}: ${rows.length}`);
}

async function main() {
  console.log("Seeding Supabase…");

  await upsert("app_config", [
    { key: "default", config: defaultSiteConfig, assets: defaultAssets },
  ], "key");

  await upsert("brands", brands.map((b) => ({
    id: uuid(b.id), slug: b.slug, name: b.name, logo_url: b.logoUrl ?? null,
  })));

  await upsert("categories", categories.map((c) => ({
    id: uuid(c.id), slug: c.slug, name: c.name,
    parent_id: c.parentId ? uuid(c.parentId) : null,
    image_url: c.imageUrl ?? null, sort_order: c.order, visible: c.visible,
  })));

  await upsert("products", products.map((p) => ({
    id: uuid(p.id), slug: p.slug, name: p.name, description: p.description,
    brand_id: uuid(p.brand.id), price: p.price, compare_at_price: p.compareAtPrice ?? null,
    details: p.details, available: p.available, created_at: p.createdAt,
  })));

  await upsert("product_categories", products.flatMap((p) =>
    p.categoryIds.map((categoryId) => ({ product_id: uuid(p.id), category_id: uuid(categoryId) })),
  ), "product_id,category_id");

  await upsert("product_images", products.flatMap((p) =>
    p.images.map((im, i) => ({
      id: uuid(`${p.id}-img-${i}`), product_id: uuid(p.id), url: im.url, alt: im.alt, sort_order: im.order,
    })),
  ));

  await upsert("product_variants", products.flatMap((p) =>
    p.variants.map((v) => ({
      id: uuid(`${p.id}-${v.id}`), product_id: uuid(p.id), sku: v.sku, options: v.options,
      price: v.price, compare_at_price: v.compareAtPrice ?? null, inventory: v.inventory,
    })),
  ));

  await upsert("collections", collections.map((c) => ({
    id: uuid(c.id), slug: c.slug, title: c.title, subtitle: c.subtitle ?? null,
    banner_image: c.bannerImage ?? null,
  })));

  await upsert("collection_products", collections.flatMap((c) =>
    c.productIds.map((productId, i) => ({ collection_id: uuid(c.id), product_id: uuid(productId), sort_order: i })),
  ), "collection_id,product_id");

  await upsert("banners", banners.map((b) => ({
    id: uuid(b.id), slug: b.id, title: b.title, subtitle: b.subtitle ?? null,
    cta_label: b.ctaLabel ?? null, href: b.href, image_url: b.imageUrl,
    image_alt: b.imageAlt, active: true,
  })));

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
