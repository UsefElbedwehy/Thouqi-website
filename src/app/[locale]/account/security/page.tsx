import { setRequestLocale, getTranslations } from "next-intl/server";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";

export default async function AccountSecurityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");

  return (
    <section>
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">{t("security")}</h2>
      <ChangePasswordForm />
    </section>
  );
}
