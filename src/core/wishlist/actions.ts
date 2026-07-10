"use server";

import { z } from "zod";
import { getCurrentUser } from "@/core/auth/user";
import { createSupabaseServerClient } from "@/data/supabase/server";
import { getCollectionProducts } from "@/core/catalog/service";
import type { WishlistItem } from "./store";

export interface WishlistMergeResult {
  ok: boolean;
  newItems?: WishlistItem[];
}

/**
 * Called right after sign-in/sign-up: pushes the guest's locally-wishlisted
 * products into the account's server wishlist, then returns any items already
 * saved on the account (e.g. from another device) that aren't in the local
 * list yet, so the client store can top itself up.
 */
export async function mergeWishlistAction(localProductIds: unknown): Promise<WishlistMergeResult> {
  const parsed = z.array(z.string().uuid()).safeParse(localProductIds);
  if (!parsed.success) return { ok: false };

  const user = await getCurrentUser();
  if (!user) return { ok: false };

  const supabase = await createSupabaseServerClient();

  if (parsed.data.length) {
    await supabase
      .from("wishlist_items")
      .upsert(
        parsed.data.map((productId) => ({ customer_id: user.id, product_id: productId })),
        { onConflict: "customer_id,product_id", ignoreDuplicates: true },
      );
  }

  const { data } = await supabase.from("wishlist_items").select("product_id").eq("customer_id", user.id);
  const serverIds = ((data as { product_id: string }[]) ?? []).map((r) => r.product_id);
  const localSet = new Set(parsed.data);
  const missingIds = serverIds.filter((id) => !localSet.has(id));
  if (!missingIds.length) return { ok: true, newItems: [] };

  const products = await getCollectionProducts(missingIds);
  const newItems: WishlistItem[] = products.map((p) => ({
    productId: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand.name,
    image: p.images[0]?.url,
    price: p.price,
  }));
  return { ok: true, newItems };
}

/**
 * Keep the account's server wishlist in sync with local toggles/removals made
 * while signed in. No-ops (silently) for guests — their wishlist stays local
 * until the next `mergeWishlistAction` at sign-in.
 */
export async function setWishlistItemAction(productId: string, saved: boolean): Promise<{ ok: boolean }> {
  if (!z.string().uuid().safeParse(productId).success) return { ok: false };

  const user = await getCurrentUser();
  if (!user) return { ok: false };

  const supabase = await createSupabaseServerClient();
  if (saved) {
    await supabase.from("wishlist_items").upsert(
      { customer_id: user.id, product_id: productId },
      { onConflict: "customer_id,product_id", ignoreDuplicates: true },
    );
  } else {
    await supabase.from("wishlist_items").delete().eq("customer_id", user.id).eq("product_id", productId);
  }
  return { ok: true };
}
