import type { Product } from "@/core/catalog/types";
import { ProductCard } from "./ProductCard";

/** Responsive product grid (2 cols mobile → 3/4 desktop). */
export function ProductGrid({
  products,
  locale,
}: {
  products: Product[];
  locale: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} locale={locale} />
      ))}
    </div>
  );
}
