"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/core/cart/store";
import { useUI } from "@/core/ui/store";

/**
 * Header bag control: minimal icon with a live count badge; opens the cart
 * drawer. Matches the header's other icon actions for a refined look.
 */
export function CartButton() {
  const tc = useTranslations("common");
  const openCart = useUI((s) => s.openCart);
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={tc("myBag")}
      className="relative text-foreground transition-colors hover:text-primary"
    >
      <ShoppingBag className="size-5" strokeWidth={1.5} />
      {mounted && count > 0 && (
        <span className="absolute -end-2 -top-2 flex size-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
