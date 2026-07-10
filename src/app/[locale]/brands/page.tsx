import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getBrands } from "@/core/catalog/service";
import { t } from "@/lib/format";
import { localizedAlternates } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tn = await getTranslations({ locale, namespace: "nav" });
  return { title: tn("brands"), alternates: localizedAlternates("/brands", locale) };
}

export default async function BrandsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [brands, tn] = await Promise.all([getBrands(), getTranslations("nav")]);

  return (
    <Container className="py-12">
      <h1 className="mb-10 text-center font-display text-4xl font-semibold uppercase tracking-[0.06em]">
        {tn("brands")}
      </h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/brands/${b.slug}` as never}
            className="flex aspect-[3/2] items-center justify-center border border-border bg-background text-center transition-colors hover:border-primary hover:bg-muted/40"
          >
            <span className="px-4 text-sm font-semibold uppercase tracking-[0.14em]">{t(b.name, locale)}</span>
          </Link>
        ))}
      </div>
    </Container>
  );
}
