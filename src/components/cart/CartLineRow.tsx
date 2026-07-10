"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Minus, Plus, X } from "lucide-react";
import { useCart, type CartLine } from "@/core/cart/store";
import { t, formatPrice } from "@/lib/format";
import { defaultAssets } from "@/config/assets.config";

/**
 * A single cart line with quantity stepper and remove control. Shared by the
 * drawer and the full cart page.
 */
export function CartLineRow({ line, locale }: { line: CartLine; locale: string }) {
  const tcart = useTranslations("cart");
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const image = line.image ?? defaultAssets.placeholders.product;

  return (
    <div className="flex gap-3 py-4">
      <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden bg-muted">
        <Image src={image} alt={t(line.name, locale)} fill sizes="64px" className="object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide">{t(line.brand, locale)}</p>
        <p className="truncate text-sm text-muted-foreground">{t(line.name, locale)}</p>
        <p className="mt-1 text-sm font-medium">{formatPrice(line.price, locale)}</p>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity(line.productId, line.variantId, line.quantity - 1)}
              className="flex size-7 items-center justify-center hover:bg-muted"
            >
              <Minus className="size-3" />
            </button>
            <span className="min-w-8 text-center text-sm">{line.quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity(line.productId, line.variantId, line.quantity + 1)}
              className="flex size-7 items-center justify-center hover:bg-muted"
            >
              <Plus className="size-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => remove(line.productId, line.variantId)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent"
          >
            <X className="size-3" />
            {tcart("remove")}
          </button>
        </div>
      </div>
    </div>
  );
}
