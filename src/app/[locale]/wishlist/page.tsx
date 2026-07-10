import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { WishlistView } from "@/components/wishlist/WishlistView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tw = await getTranslations({ locale, namespace: "wishlist" });
  return { title: tw("title"), robots: { index: false } };
}

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tw = await getTranslations("wishlist");

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold uppercase tracking-wide">{tw("title")}</h1>
      <WishlistView locale={locale} />
    </Container>
  );
}
