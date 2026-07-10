import { setRequestLocale } from "next-intl/server";
import { readAdminConfig } from "@/core/admin/config-service";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const config = await readAdminConfig();

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-semibold uppercase tracking-[0.06em]">Settings</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Branding, palette and feature flags. Saved to the remote config and applied storefront-wide.
      </p>
      <SettingsForm
        initial={{
          nameEn: config.name.en ?? "",
          nameAr: config.name.ar ?? "",
          primary: config.theme.colors.primary,
          accent: config.theme.colors.accent,
          background: config.theme.colors.background,
          foreground: config.theme.colors.foreground,
          features: config.features as unknown as Record<string, boolean>,
        }}
      />
    </div>
  );
}
