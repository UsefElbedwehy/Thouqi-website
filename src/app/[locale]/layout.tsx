import type { ReactNode } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getDirection } from "@/config/locales";
import { getSiteConfig } from "@/config";
import { t } from "@/lib/format";
import { fontVariables } from "@/app/fonts";
import { ThemeStyle } from "@/components/theme/ThemeStyle";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const config = await getSiteConfig();
  const name = t(config.name, locale);
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: name, template: `%s · ${name}` },
    description: t(config.tagline, locale),
    icons: { icon: config.favicon },
    openGraph: {
      siteName: name,
      locale: locale === "ar" ? "ar_KW" : "en_KW",
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const dir = getDirection(locale);
  const config = await getSiteConfig();

  // Admin routes render their own standalone chrome (no storefront header/footer).
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isAdmin = pathname.includes("/admin");

  return (
    <html lang={locale} dir={dir} className={fontVariables} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeStyle config={config} />
        <NextIntlClientProvider>
          {isAdmin ? (
            children
          ) : (
            <>
              <SiteHeader config={config} locale={locale} />
              <main className="flex-1">{children}</main>
              <SiteFooter config={config} locale={locale} />
              <CartDrawer locale={locale} />
              <GoogleAnalytics />
            </>
          )}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
