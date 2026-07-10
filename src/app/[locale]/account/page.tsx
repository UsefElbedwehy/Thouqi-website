import { setRequestLocale, getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/core/auth/user";
import { ProfileForm } from "@/components/account/ProfileForm";

export default async function AccountOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getCurrentUser();
  const t = await getTranslations("account");

  const name = user?.profile?.fullName || user?.email?.split("@")[0] || "";

  return (
    <section>
      <p className="mb-6 text-lg">{t("greeting", { name })}</p>
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">{t("profile")}</h2>
      {user?.profile && <ProfileForm profile={user.profile} />}
    </section>
  );
}
