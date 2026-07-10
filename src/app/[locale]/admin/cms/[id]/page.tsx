import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getAdminCmsPage } from "@/core/admin/service";
import { CmsForm } from "@/components/admin/CmsForm";
import type { LocalizedText } from "@/config/types";

export default async function EditCmsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const page = await getAdminCmsPage(id);
  if (!page) notFound();

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold uppercase tracking-[0.06em]">Edit page</h1>
      <CmsForm
        initial={{
          id: page.id as string,
          slug: page.slug as string,
          title: page.title as LocalizedText,
          body: page.body as LocalizedText,
          published: page.published as boolean,
        }}
      />
    </div>
  );
}
