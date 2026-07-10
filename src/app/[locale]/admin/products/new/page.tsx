import { setRequestLocale } from "next-intl/server";
import { listAdminBrands, listAdminCategories } from "@/core/admin/service";
import { t } from "@/lib/format";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [brands, categories] = await Promise.all([listAdminBrands(), listAdminCategories()]);

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold uppercase tracking-[0.06em]">New product</h1>
      <ProductForm
        brands={brands.map((b) => ({ id: b.id, label: t(b.name, locale) }))}
        categories={categories.map((c) => ({ id: c.id, label: t(c.name, locale) }))}
      />
    </div>
  );
}
