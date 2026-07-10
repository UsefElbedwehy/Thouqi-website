"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { LocalizedText } from "@/config/types";
import { useCart } from "@/core/cart/store";
import { useUI } from "@/core/ui/store";
import { cn } from "@/lib/utils";

export interface QuickAddItem {
  productId: string;
  slug: string;
  name: LocalizedText;
  brand: LocalizedText;
  image?: string;
  price: number;
}

/**
 * Quick-add overlay button revealed on product-card hover. Adds to the cart and
 * opens the drawer without leaving the listing.
 */
export function QuickAddButton({ item }: { item: QuickAddItem }) {
  const tc = useTranslations("common");
  const add = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);
  const [added, setAdded] = useState(false);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add({ ...item });
    openCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center gap-2 bg-background/95 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground backdrop-blur transition-colors hover:bg-foreground hover:text-background",
      )}
    >
      {added ? <Check className="size-3.5" /> : null}
      {added ? tc("addToBag") : tc("quickAdd")}
    </button>
  );
}
