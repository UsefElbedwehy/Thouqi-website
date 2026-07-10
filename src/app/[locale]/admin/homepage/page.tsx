import { setRequestLocale } from "next-intl/server";
import { readAdminConfig } from "@/core/admin/config-service";
import { HomepageBuilder } from "@/components/admin/HomepageBuilder";

export default async function AdminHomepagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const config = await readAdminConfig();
  return <HomepageBuilder sections={config.homeSections} />;
}
