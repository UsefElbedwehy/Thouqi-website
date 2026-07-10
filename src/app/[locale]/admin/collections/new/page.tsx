import { setRequestLocale } from "next-intl/server";
import { listAdminProducts } from "@/core/admin/service";
import { t } from "@/lib/format";
import { CollectionForm } from "@/components/admin/CollectionForm";

export default async function NewCollectionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const products = await listAdminProducts();
  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold uppercase tracking-[0.06em]">New collection</h1>
      <CollectionForm products={products.map((p) => ({ id: p.id, label: t(p.name, locale) }))} />
    </div>
  );
}
