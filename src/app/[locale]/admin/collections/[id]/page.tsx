import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getAdminCollection, listAdminProducts } from "@/core/admin/service";
import { t } from "@/lib/format";
import { CollectionForm } from "@/components/admin/CollectionForm";
import type { LocalizedText } from "@/config/types";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [collection, products] = await Promise.all([getAdminCollection(id), listAdminProducts()]);
  if (!collection) notFound();

  const links = (collection.collection_products as Record<string, unknown>[]) ?? [];

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold uppercase tracking-[0.06em]">Edit collection</h1>
      <CollectionForm
        initial={{
          id: collection.id as string,
          slug: collection.slug as string,
          title: collection.title as LocalizedText,
          subtitle: (collection.subtitle as LocalizedText) ?? null,
          bannerImage: (collection.banner_image as string) ?? "",
          productIds: links.map((l) => l.product_id as string),
        }}
        products={products.map((p) => ({ id: p.id, label: t(p.name, locale) }))}
      />
    </div>
  );
}
