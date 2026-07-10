import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getAdminProduct, listAdminBrands, listAdminCategories } from "@/core/admin/service";
import { t } from "@/lib/format";
import { ProductForm } from "@/components/admin/ProductForm";
import type { LocalizedText } from "@/config/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [product, brands, categories] = await Promise.all([
    getAdminProduct(id),
    listAdminBrands(),
    listAdminCategories(),
  ]);
  if (!product) notFound();

  const images = ((product.product_images as Record<string, unknown>[]) ?? []).sort(
    (a, b) => ((a.sort_order as number) ?? 0) - ((b.sort_order as number) ?? 0),
  );
  const cats = (product.product_categories as Record<string, unknown>[]) ?? [];
  const variants = ((product.product_variants as Record<string, unknown>[]) ?? [])
    .map((v) => ({
      size: (v.options as Record<string, string>)?.size,
      inventory: (v.inventory as number) ?? 0,
    }))
    .filter((v): v is { size: string; inventory: number } => !!v.size);

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold uppercase tracking-[0.06em]">Edit product</h1>
      <ProductForm
        initial={{
          id: product.id as string,
          slug: product.slug as string,
          name: product.name as LocalizedText,
          description: product.description as LocalizedText,
          brandId: (product.brand_id as string) ?? "",
          price: product.price as number,
          compareAtPrice: (product.compare_at_price as number) ?? null,
          available: product.available as boolean,
          imageUrl: (images[0]?.url as string) ?? "",
          categoryId: (cats[0]?.category_id as string) ?? "",
          variants,
        }}
        brands={brands.map((b) => ({ id: b.id, label: t(b.name, locale) }))}
        categories={categories.map((c) => ({ id: c.id, label: t(c.name, locale) }))}
      />
    </div>
  );
}
