import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getSiteConfig } from "@/config";
import { resolveCheckoutMethods } from "@/core/payments/service";
import { Container } from "@/components/ui/Container";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tco = await getTranslations({ locale, namespace: "checkout" });
  return { title: tco("title"), robots: { index: false } };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tco = await getTranslations("checkout");
  const config = await getSiteConfig();
  const paymentMethods = await resolveCheckoutMethods(config);

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold uppercase tracking-wide">{tco("title")}</h1>
      <CheckoutView locale={locale} paymentMethods={paymentMethods} />
    </Container>
  );
}
