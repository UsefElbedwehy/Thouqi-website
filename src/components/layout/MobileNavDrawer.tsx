"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X, ChevronDown, User } from "lucide-react";
import type { NavItem } from "@/config/types";
import { useUI } from "@/core/ui/store";
import { Link } from "@/i18n/navigation";
import { t } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Slide-over nav drawer for < md. Mirrors MegaNav's data (top-level items +
 * mega-menu columns) as a mobile-friendly accordion, since MegaNav itself is
 * hidden below md.
 */
export function MobileNavDrawer({
  navigation,
  locale,
  signedIn,
}: {
  navigation: NavItem[];
  locale: string;
  signedIn: boolean;
}) {
  const tc = useTranslations("common");
  const open = useUI((s) => s.menuOpen);
  const close = useUI((s) => s.closeMenu);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) setExpanded(null);
  }, [open]);

  return (
    <>
      <div
        aria-hidden={!open}
        onClick={close}
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={tc("menu")}
        className={cn(
          "glass-strong fixed inset-y-0 start-0 z-50 flex w-full max-w-xs flex-col transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide">{tc("menu")}</h2>
          <button type="button" onClick={close} aria-label={tc("close")}>
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <ul>
            {navigation.map((item) => {
              const hasMenu = !!item.columns?.length;
              const isOpen = expanded === item.id;
              return (
                <li key={item.id} className="border-b border-border/60">
                  {hasMenu ? (
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : item.id)}
                      aria-expanded={isOpen}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-3.5 text-sm font-medium uppercase tracking-[0.1em]",
                        item.highlight ? "text-primary" : "text-foreground",
                      )}
                    >
                      {t(item.label, locale)}
                      <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
                    </button>
                  ) : (
                    <Link
                      href={item.href as never}
                      onClick={close}
                      className={cn(
                        "block px-3 py-3.5 text-sm font-medium uppercase tracking-[0.1em]",
                        item.highlight ? "text-primary" : "text-foreground",
                      )}
                    >
                      {t(item.label, locale)}
                    </Link>
                  )}

                  {hasMenu && isOpen && (
                    <div className="space-y-4 px-3 pb-4">
                      {item.columns!.map((col, i) => (
                        <div key={i}>
                          {col.heading && (
                            <p className="mb-2 font-display text-sm italic text-primary">{t(col.heading, locale)}</p>
                          )}
                          <ul className="space-y-2">
                            {col.links.map((link, j) => (
                              <li key={j}>
                                <Link
                                  href={link.href as never}
                                  onClick={close}
                                  className="block text-sm text-muted-foreground hover:text-foreground"
                                >
                                  {t(link.label, locale)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center justify-between border-t border-border p-4">
          <Link href="/account" onClick={close} className="flex items-center gap-2 text-sm text-foreground hover:text-primary">
            <User className="size-4" />
            {signedIn ? tc("account") : tc("signIn")}
          </Link>
          <LanguageSwitcher locale={locale} />
        </div>
      </aside>
    </>
  );
}
