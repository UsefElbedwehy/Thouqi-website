import { getTranslations } from "next-intl/server";
import { Search, Heart, User } from "lucide-react";
import type { SiteConfig } from "@/config/types";
import { t } from "@/lib/format";
import { getCurrentUser } from "@/core/auth/user";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MegaNav } from "./MegaNav";
import { AnnouncementBar } from "./AnnouncementBar";
import { SearchBox } from "./SearchBox";
import { CartButton } from "@/components/cart/CartButton";

/**
 * Premium storefront header: announcement bar, a thin utility row, an elegant
 * brand + search + actions row, and the mega-navigation. Sticky with a subtle
 * translucent backdrop. Fully config-driven and localized.
 */
export async function SiteHeader({
  config,
  locale,
}: {
  config: SiteConfig;
  locale: string;
}) {
  const tc = await getTranslations("common");
  const brand = t(config.name, locale);
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40">
      <AnnouncementBar />

      <div className="border-b border-border bg-background/85 backdrop-blur-md">
        {/* Utility row */}
        <Container className="flex h-9 items-center justify-end gap-5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <LanguageSwitcher locale={locale} />
          <span aria-hidden className="text-border">/</span>
          {user ? (
            <Link href="/account" className="link-underline hover:text-foreground">
              {tc("account")}
            </Link>
          ) : (
            <>
              <Link href="/register" className="link-underline hover:text-foreground">
                {tc("register")}
              </Link>
              <Link href="/login" className="link-underline hover:text-foreground">
                {tc("signIn")}
              </Link>
            </>
          )}
        </Container>

        {/* Brand + search + actions */}
        <Container className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 py-5">
          <div className="hidden items-center md:flex">
            {config.features.liveSearch ? (
              <SearchBox />
            ) : (
              <form action={`/${locale}/search`} className="flex w-full max-w-[280px] items-center gap-2 border-b border-border pb-1.5 focus-within:border-foreground">
                <Search className="size-4 text-muted-foreground" />
                <input
                  type="search"
                  name="q"
                  placeholder={tc("search")}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground placeholder:tracking-wide"
                  aria-label={tc("search")}
                />
              </form>
            )}
          </div>

          <Link
            href="/"
            className="col-start-2 justify-self-center text-center"
            aria-label={brand}
          >
            <span className="font-display text-4xl font-semibold uppercase tracking-[0.14em] text-foreground">
              {brand}
            </span>
          </Link>

          <div className="col-start-3 flex items-center justify-end gap-4">
            {config.features.wishlist && (
              <Link
                href="/wishlist"
                className="hidden text-foreground transition-colors hover:text-primary sm:block"
                aria-label={tc("wishlist")}
              >
                <Heart className="size-5" strokeWidth={1.5} />
              </Link>
            )}
            <Link
              href="/account"
              className="hidden text-foreground transition-colors hover:text-primary sm:block"
              aria-label={tc("account")}
            >
              <User className="size-5" strokeWidth={1.5} />
            </Link>
            <CartButton />
          </div>
        </Container>

        {/* Primary navigation */}
        <MegaNav config={config} locale={locale} />
      </div>
    </header>
  );
}
