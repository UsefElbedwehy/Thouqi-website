import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { HomeSection } from "@/config/types";
import { getBanners } from "@/core/catalog/service";
import { t } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/Button";

/** Cinematic promotional banner referenced by id from section settings. */
export async function PromoBannerSection({
  section,
  locale,
}: {
  section: HomeSection;
  locale: string;
}) {
  const bannerId = section.settings.bannerId as string | undefined;
  const banners = await getBanners();
  const banner = banners.find((b) => b.id === bannerId) ?? banners[0];
  if (!banner) return null;

  const tc = await getTranslations("common");

  return (
    <section className="py-16">
      <Container>
        <Link
          href={banner.href as never}
          className="group relative block aspect-[21/9] w-full overflow-hidden bg-foreground"
        >
          <Image
            src={banner.imageUrl}
            alt={t(banner.imageAlt, locale)}
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 flex flex-col items-start justify-center gap-5 p-10 text-white sm:p-16">
            {banner.subtitle && (
              <span className="text-xs font-medium uppercase tracking-[0.3em] text-white/80">
                {t(banner.subtitle, locale)}
              </span>
            )}
            <h2 className="max-w-xl font-display text-4xl font-semibold uppercase leading-tight tracking-[0.05em] drop-shadow sm:text-6xl">
              {t(banner.title, locale)}
            </h2>
            <span
              className={buttonClass({
                variant: "outline",
                size: "md",
                className: "border-white/90 text-white group-hover:bg-white group-hover:text-foreground",
              })}
            >
              {t(banner.ctaLabel, locale) || tc("shopNow")}
            </span>
          </div>
        </Link>
      </Container>
    </section>
  );
}
