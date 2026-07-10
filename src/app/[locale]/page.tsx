import { setRequestLocale } from "next-intl/server";
import { getSiteConfig } from "@/config";
import { HomeSections } from "@/components/home/HomeSections";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const config = await getSiteConfig();

  return <HomeSections config={config} locale={locale} />;
}
