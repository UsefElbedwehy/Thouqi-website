import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { HomeSection } from "@/config/types";
import { getFeaturedCategories } from "@/core/catalog/service";
import { t } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "../SectionHeading";

/** Editorial grid of shoppable category tiles with overlaid serif labels. */
export async function CategoryGridSection({
  section,
  locale,
}: {
  section: HomeSection;
  locale: string;
}) {
  const limit = (section.settings.limit as number) ?? 6;
  const categories = await getFeaturedCategories(limit);
  if (!categories.length) return null;

  const [th, tc] = await Promise.all([
    getTranslations("home"),
    getTranslations("common"),
  ]);

  return (
    <section className="py-16">
      <Container>
        <SectionHeading kicker={tc("discover")} title={th("shopByCategory")} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/c/${c.slug}` as never}
              className="group relative aspect-[4/5] overflow-hidden bg-muted"
            >
              {c.imageUrl && (
                <Image
                  src={c.imageUrl}
                  alt={t(c.name, locale)}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-end gap-2 p-6 text-center">
                <span className="font-display text-2xl font-semibold uppercase tracking-[0.08em] text-white">
                  {t(c.name, locale)}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/0 transition-colors duration-300 group-hover:text-white/90">
                  {tc("shopNow")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
