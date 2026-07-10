import { setRequestLocale } from "next-intl/server";
import { listAdminCategories } from "@/core/admin/service";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const categories = await listAdminCategories();

  return (
    <CategoryManager
      categories={categories.map((c) => ({
        ...c,
        nameEn: c.name.en ?? "",
        nameAr: c.name.ar ?? "",
      }))}
    />
  );
}
