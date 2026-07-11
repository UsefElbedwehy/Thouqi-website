"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

/**
 * Hamburger trigger + slide-over drawer for the admin sidebar nav below md,
 * where the fixed sidebar in AdminLayout is hidden. Without this, admin
 * sections other than the dashboard are unreachable on mobile.
 */
export function AdminMobileNav({ nav, adminEmail }: { nav: AdminNavItem[]; adminEmail?: string | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open admin menu"
        className="fixed start-4 top-4 z-40 flex items-center gap-2 rounded-[--radius] border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm md:hidden"
      >
        <Menu className="size-4" />
        Menu
      </button>

      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Admin menu"
        className={cn(
          "glass-strong fixed inset-y-0 start-0 z-50 flex w-full max-w-xs flex-col overflow-y-auto transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <span className="font-display text-xl font-semibold uppercase tracking-wide">Admin</span>
            {adminEmail && <p className="mt-1 truncate text-xs text-muted-foreground">{adminEmail}</p>}
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>

        <nav className="space-y-1 p-3">
          {nav.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href as never}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-[--radius] px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              {icon}
              {label}
            </Link>
          ))}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="mt-4 flex items-center gap-3 rounded-[--radius] px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" />
            Back to store
          </Link>
        </nav>
      </aside>
    </>
  );
}
