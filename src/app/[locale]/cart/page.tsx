import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { CartView } from "@/components/cart/CartView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tcart = await getTranslations({ locale, namespace: "cart" });
  return { title: tcart("title"), robots: { index: false } };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tcart = await getTranslations("cart");

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold uppercase tracking-wide">{tcart("title")}</h1>
      <CartView locale={locale} />
    </Container>
  );
}
