import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getPublishedPage } from "@/core/cms/service";
import { getSiteConfig } from "@/config";
import { t } from "@/lib/format";
import { localizedAlternates } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

type Params = { locale: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) return {};
  return {
    title: t(page.title, locale),
    alternates: localizedAlternates(`/pages/${slug}`, locale),
  };
}

export default async function CmsPageRoute({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = await getPublishedPage(slug);
  if (!page) notFound();
  // config resolved to keep request context warm / future breadcrumbs
  await getSiteConfig();

  return (
    <Container className="max-w-3xl py-14">
      <h1 className="mb-8 font-display text-4xl font-semibold uppercase tracking-[0.06em]">
        {t(page.title, locale)}
      </h1>
      <article
        className="prose max-w-none text-foreground [&_a]:text-primary [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_li]:my-1 [&_p]:my-4 [&_ul]:list-disc [&_ul]:ps-6"
        dangerouslySetInnerHTML={{ __html: t(page.body, locale) }}
      />
    </Container>
  );
}
