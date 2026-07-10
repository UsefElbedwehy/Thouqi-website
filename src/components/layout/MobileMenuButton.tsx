"use client";

import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { useUI } from "@/core/ui/store";

/** Hamburger trigger for the mobile nav drawer; hidden at md and up. */
export function MobileMenuButton() {
  const tc = useTranslations("common");
  const openMenu = useUI((s) => s.openMenu);
  return (
    <button type="button" onClick={openMenu} aria-label={tc("menu")} className="text-foreground md:hidden">
      <Menu className="size-6" strokeWidth={1.5} />
    </button>
  );
}
