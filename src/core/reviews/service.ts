import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Storefront review reads. Uses the anon key; RLS only exposes approved reviews.
 */
export interface Review {
  id: string;
  rating: number;
  body: string | null;
  authorName: string | null;
  createdAt: string;
}

export interface ReviewSummary {
  reviews: Review[];
  average: number;
  count: number;
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function getProductReviews(productId: string): Promise<ReviewSummary> {
  const { data, error } = await db()
    .from("reviews")
    .select("id, rating, body, author_name, created_at")
    .eq("product_id", productId)
    .eq("approved", true)
    .order("created_at", { ascending: false });
  if (error) return { reviews: [], average: 0, count: 0 };

  const reviews: Review[] = ((data as Record<string, unknown>[]) ?? []).map((r) => ({
    id: r.id as string,
    rating: r.rating as number,
    body: (r.body as string) ?? null,
    authorName: (r.author_name as string) ?? null,
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  }));
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { reviews, average, count };
}
