import { NextResponse } from "next/server";
import { searchSuggest } from "@/core/catalog/service";

/**
 * Typeahead search suggestions. Returns a small set of products with localized
 * names so the client SearchBox can render a dropdown. Public, read-only.
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (q.trim().length < 2) return NextResponse.json({ results: [] });

  const products = await searchSuggest(q, 6);
  const results = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand.name,
    image: p.images[0]?.url ?? null,
    price: p.price,
  }));
  return NextResponse.json({ results });
}
