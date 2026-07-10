import { setRequestLocale } from "next-intl/server";
import { CmsForm } from "@/components/admin/CmsForm";

export default async function NewCmsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold uppercase tracking-[0.06em]">New page</h1>
      <CmsForm />
    </div>
  );
}
