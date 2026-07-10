import type { ReactNode } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/core/auth/user";
import { Container } from "@/components/ui/Container";
import { AccountNav } from "@/components/account/AccountNav";

/**
 * Protected account shell. Redirects unauthenticated visitors to /login and
 * renders the account nav alongside the active section.
 */
export default async function AccountLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect({ href: "/login", locale });

  const t = await getTranslations("account");

  return (
    <Container className="py-10">
      <h1 className="mb-8 font-display text-3xl font-semibold uppercase tracking-[0.08em]">
        {t("title")}
      </h1>
      <div className="flex flex-col gap-10 lg:flex-row">
        <AccountNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Container>
  );
}
