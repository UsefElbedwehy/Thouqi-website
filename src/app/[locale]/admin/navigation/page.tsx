import { setRequestLocale } from "next-intl/server";
import { readAdminConfig } from "@/core/admin/config-service";
import { NavEditor } from "@/components/admin/NavEditor";

export default async function AdminNavigationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const config = await readAdminConfig();

  const items = config.navigation.map((item) => ({
    id: item.id,
    labelEn: item.label.en ?? "",
    labelAr: item.label.ar ?? "",
    href: item.href,
    highlight: item.highlight ?? false,
    columns: (item.columns ?? []).map((c) => ({
      headingEn: c.heading?.en ?? "",
      headingAr: c.heading?.ar ?? "",
      links: c.links.map((l) => ({ labelEn: l.label.en ?? "", labelAr: l.label.ar ?? "", href: l.href })),
    })),
  }));

  return <NavEditor items={items} />;
}
