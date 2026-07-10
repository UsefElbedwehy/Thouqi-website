import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getCatalogRepository } from "@/data";
import { SITE_URL } from "@/lib/seo";

/**
 * Multilingual sitemap. Emits every route for every locale with `alternates`
 * language links so search engines index the correct localized URLs.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = getCatalogRepository();
  const [categories, products] = await Promise.all([
    repo.listCategories(),
    repo.queryProducts({ pageSize: 1000 }),
  ]);

  const paths = [
    "",
    "/brands",
    ...categories.map((c) => `/c/${c.slug}`),
    ...products.items.map((p) => `/p/${p.slug}`),
  ];

  return paths.map((path) => ({
    url: `${SITE_URL}/${routing.defaultLocale}${path}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
      ),
    },
  }));
}
