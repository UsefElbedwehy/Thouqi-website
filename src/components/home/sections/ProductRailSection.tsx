import { getTranslations } from "next-intl/server";
import type { HomeSection, LocalizedText } from "@/config/types";
import { getRailProducts } from "@/core/catalog/service";
import { t } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "../SectionHeading";
import { ProductCard } from "@/components/catalog/ProductCard";

/**
 * Horizontally scrollable rail of products, sourced per the section settings
 * (newest / category / collection). Title can be a message key or an inline
 * localized string set from the dashboard.
 */
export async function ProductRailSection({
  section,
  locale,
}: {
  section: HomeSection;
  locale: string;
}) {
  const products = await getRailProducts(section.settings);
  if (!products.length) return null;

  const tc = await getTranslations();

  const titleKey = section.settings.titleKey as string | undefined;
  const titleText = section.settings.title as LocalizedText | undefined;
  const title = titleKey ? tc(titleKey as never) : titleText ? t(titleText, locale) : "";
  const viewAllHref = section.settings.viewAllHref as string | undefined;

  return (
    <section className="py-16">
      <Container>
        <SectionHeading
          title={title}
          actionLabel={viewAllHref ? tc("home.moreNewIn") : undefined}
          actionHref={viewAllHref}
        />
        <div className="no-scrollbar -mx-4 flex snap-x gap-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {products.map((p) => (
            <div key={p.id} className="w-[62%] shrink-0 snap-start sm:w-[32%] lg:w-[23.5%]">
              <ProductCard product={p} locale={locale} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
