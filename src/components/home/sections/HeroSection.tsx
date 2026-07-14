import { getTranslations } from "next-intl/server";
import { getBanners } from "@/core/catalog/service";
import type { HomeSection } from "@/config/types";
import { HeroCarousel } from "./HeroCarousel";

/**
 * Full-bleed hero. Renders every active banner as an autoplaying carousel
 * (falls back to a single static slide with no controls when there's only
 * one banner) — see HeroCarousel for the client-side autoplay/controls.
 */
export async function HeroSection({ locale }: { section: HomeSection; locale: string }) {
  const banners = await getBanners();
  if (!banners.length) return null;

  const tc = await getTranslations("common");

  return <HeroCarousel banners={banners} locale={locale} shopNowLabel={tc("shopNow")} />;
}
