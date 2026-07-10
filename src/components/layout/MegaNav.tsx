import type { SiteConfig, NavItem } from "@/config/types";
import { t } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

/**
 * Primary navigation with CSS-only mega menus. Top-level items use an elegant
 * animated underline; items with `columns` reveal a panel that fades and lifts
 * in. RTL mirrors automatically via logical properties.
 */
export function MegaNav({ config, locale }: { config: SiteConfig; locale: string }) {
  return (
    <nav aria-label="Primary" className="hidden border-t border-border md:block">
      <Container>
        <ul className="flex items-center justify-center gap-8 text-[13px] font-medium">
          {config.navigation.map((item) => (
            <NavTopItem key={item.id} item={item} locale={locale} />
          ))}
        </ul>
      </Container>
    </nav>
  );
}

function NavTopItem({ item, locale }: { item: NavItem; locale: string }) {
  const hasMenu = !!item.columns?.length;
  return (
    <li className="group static">
      <Link
        href={item.href as never}
        className={cn(
          "link-underline flex h-12 items-center uppercase tracking-[0.14em] transition-colors hover:text-primary",
          item.highlight ? "text-primary" : "text-foreground",
        )}
      >
        {t(item.label, locale)}
      </Link>

      {hasMenu && (
        <div
          className={cn(
            "invisible absolute inset-x-0 top-full z-40 translate-y-1 opacity-0 transition-all duration-300",
            "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
            "group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
          )}
        >
          <div className="glass-strong">
            <Container className="flex gap-16 py-10">
              {item.columns!.map((col, i) => (
                <div key={i} className="min-w-[160px]">
                  {col.heading && (
                    <p className="mb-4 font-display text-lg italic text-primary">
                      {t(col.heading, locale)}
                    </p>
                  )}
                  <ul className="space-y-3">
                    {col.links.map((link, j) => (
                      <li key={j}>
                        <Link
                          href={link.href as never}
                          className="link-underline inline-block whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {t(link.label, locale)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Container>
          </div>
        </div>
      )}
    </li>
  );
}
