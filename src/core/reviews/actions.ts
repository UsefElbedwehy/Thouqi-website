"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/core/auth/user";
import { assertAdmin } from "@/core/admin/guard";

const schema = z.object({
  productId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().max(2000).optional().default(""),
  slug: z.string().optional(),
});

export interface ReviewResult {
  ok: boolean;
  error?: "auth" | "invalid" | "server";
}

/**
 * Submit a product review. Requires sign-in. The review is created unapproved
 * (`approved=false`) and appears publicly only after an admin approves it. RLS
 * enforces that a customer can only insert their own review.
 */
export async function submitReviewAction(raw: unknown): Promise<ReviewResult> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "auth" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("reviews").insert({
    product_id: parsed.data.productId,
    customer_id: user.id,
    rating: parsed.data.rating,
    body: parsed.data.body || null,
    author_name: user.profile?.fullName?.split(" ")[0] ?? "Customer",
    approved: false,
  });
  if (error) return { ok: false, error: "server" };

  if (parsed.data.slug) revalidatePath(`/p/${parsed.data.slug}`);
  return { ok: true };
}

/** Approve a pending review (admin only) so it becomes publicly visible. */
export async function approveReviewAction(id: string): Promise<ReviewResult> {
  await assertAdmin();
  const db = createSupabaseAdminClient();
  const { error } = await db.from("reviews").update({ approved: true }).eq("id", id);
  if (error) return { ok: false, error: "server" };
  revalidatePath("/admin/reviews");
  return { ok: true };
}

/** Reject (delete) a pending review (admin only). */
export async function rejectReviewAction(id: string): Promise<ReviewResult> {
  await assertAdmin();
  const db = createSupabaseAdminClient();
  const { error } = await db.from("reviews").delete().eq("id", id);
  if (error) return { ok: false, error: "server" };
  revalidatePath("/admin/reviews");
  return { ok: true };
}
