import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getBanners } from "@/core/catalog/service";
import type { HomeSection } from "@/config/types";
import { t } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/components/ui/Button";

/**
 * Cinematic full-bleed hero with a gradient scrim, editorial serif headline and
 * a slow image zoom. (Carousel autoplay arrives with the Embla upgrade; this
 * SSR baseline shows the primary slide with no layout shift.)
 */
export async function HeroSection({ locale }: { section: HomeSection; locale: string }) {
  const banners = await getBanners();
  const hero = banners.find((b) => b.id === "escape-in-style") ?? banners[0];
  if (!hero) return null;

  const tc = await getTranslations("common");

  return (
    <section className="relative h-[68vh] min-h-[460px] w-full overflow-hidden bg-foreground">
      <Image
        src={hero.imageUrl}
        alt={t(hero.imageAlt, locale)}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center motion-safe:animate-[zoom-slow_20s_ease-out_forwards]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/10" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center text-white">
        <span className="animate-fade-up text-xs font-medium uppercase tracking-[0.4em] text-white/80">
          {tc("discover")}
        </span>
        <h1 className="max-w-3xl font-display text-5xl font-semibold uppercase leading-[1.05] tracking-[0.06em] drop-shadow-sm sm:text-7xl">
          {t(hero.title, locale)}
        </h1>
        <Link
          href={hero.href as never}
          className={buttonClass({
            variant: "outline",
            size: "lg",
            className: "mt-2 border-white/90 text-white hover:bg-white hover:text-foreground",
          })}
        >
          {t(hero.ctaLabel, locale) || tc("shopNow")}
        </Link>
      </div>
    </section>
  );
}
