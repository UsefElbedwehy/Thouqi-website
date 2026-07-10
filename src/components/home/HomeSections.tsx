import type { SiteConfig, HomeSection } from "@/config/types";
import { orderedHomeSections } from "@/config";
import { Reveal } from "@/components/ui/Reveal";
import { HeroSection } from "./sections/HeroSection";
import { ProductRailSection } from "./sections/ProductRailSection";
import { CategoryGridSection } from "./sections/CategoryGridSection";
import { PromoBannerSection } from "./sections/PromoBannerSection";

/**
 * Renders the homepage from the config-driven, ordered, toggleable section
 * list (page-builder model). Adding a new section type = add a case here + a
 * component; the dashboard controls order/enablement/settings — no code edits
 * needed to rearrange the homepage.
 */
export function HomeSections({ config, locale }: { config: SiteConfig; locale: string }) {
  const sections = orderedHomeSections(config);
  return (
    <>
      {sections.map((section) =>
        section.type === "hero" ? (
          <SectionRenderer key={section.id} section={section} locale={locale} />
        ) : (
          <Reveal key={section.id}>
            <SectionRenderer section={section} locale={locale} />
          </Reveal>
        ),
      )}
    </>
  );
}

function SectionRenderer({ section, locale }: { section: HomeSection; locale: string }) {
  switch (section.type) {
    case "hero":
      return <HeroSection section={section} locale={locale} />;
    case "productRail":
      return <ProductRailSection section={section} locale={locale} />;
    case "categoryGrid":
      return <CategoryGridSection section={section} locale={locale} />;
    case "promoBanner":
    case "collectionShowcase":
      return <PromoBannerSection section={section} locale={locale} />;
    default:
      return null;
  }
}
