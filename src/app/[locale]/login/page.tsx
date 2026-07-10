import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/core/auth/user";
import { Container } from "@/components/ui/Container";
import { AuthForm } from "@/components/auth/AuthForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("signInTitle"), robots: { index: false } };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (await getCurrentUser()) redirect({ href: "/account", locale });

  const t = await getTranslations("auth");

  return (
    <Container className="flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center font-display text-3xl font-semibold uppercase tracking-[0.08em]">
          {t("signInTitle")}
        </h1>
        <AuthForm mode="signin" />
      </div>
    </Container>
  );
}
