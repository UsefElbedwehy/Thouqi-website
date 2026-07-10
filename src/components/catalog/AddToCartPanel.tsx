"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { LocalizedText } from "@/config/types";
import type { ProductVariant } from "@/core/catalog/types";
import { useCart } from "@/core/cart/store";
import { useUI } from "@/core/ui/store";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { WishlistButton } from "./WishlistButton";

export interface AddToCartProduct {
  id: string;
  slug: string;
  name: LocalizedText;
  brand: LocalizedText;
  image?: string;
  price: number;
  variants: ProductVariant[];
}

/**
 * Price + size/variant selection + Add to Bag / Wishlist.
 *
 * Business rule: when a product has size variants, a size MUST be chosen before
 * it can be added — no size is preselected, and the button stays disabled with a
 * prompt until one is picked. Products with no variants (one-size items) add
 * directly.
 */
export function AddToCartPanel({
  product,
  locale,
}: {
  product: AddToCartProduct;
  locale: string;
}) {
  const tc = useTranslations("common");
  const tp = useTranslations("product");
  const add = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);

  const hasVariants = product.variants.length > 0;
  const isSize = product.variants.some((v) => "size" in (v.options ?? {}));

  // No preselection: the customer must choose their size.
  const [variantId, setVariantId] = useState<string | undefined>(undefined);
  const [added, setAdded] = useState(false);
  const [tried, setTried] = useState(false);

  const selected = useMemo(
    () => product.variants.find((v) => v.id === variantId),
    [product.variants, variantId],
  );

  const price = selected?.price ?? product.price;
  const outOfStock = selected ? selected.inventory <= 0 : false;
  const needsSelection = hasVariants && !selected;

  function handleAdd() {
    if (needsSelection) {
      setTried(true);
      return;
    }
    add({
      productId: product.id,
      variantId,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      image: product.image,
      price,
    });
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="space-y-5">
      <p className="text-xl font-semibold">{formatPrice(price, locale)}</p>

      {hasVariants && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
              {isSize ? tp("selectSize") : tp("selectOption")}
            </span>
            {tried && needsSelection && (
              <span className="text-xs font-medium text-accent">{tp("sizeRequired")}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const label = Object.values(v.options).join(" · ") || v.sku;
              const disabled = v.inventory <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setVariantId(v.id);
                    setTried(false);
                  }}
                  className={cn(
                    "min-w-11 border px-3 py-2 text-sm transition-colors",
                    v.id === variantId ? "border-primary bg-primary/5 text-primary" : "border-border",
                    tried && needsSelection && "border-accent",
                    disabled && "cursor-not-allowed text-muted-foreground line-through opacity-50",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          aria-disabled={needsSelection}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-[--radius] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-300",
            outOfStock
              ? "cursor-not-allowed bg-muted text-muted-foreground"
              : needsSelection
                ? "bg-muted text-muted-foreground hover:bg-muted"
                : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground",
          )}
        >
          {added ? (
            <>
              <Check className="size-4" /> {tp("addedToBag")}
            </>
          ) : outOfStock ? (
            tp("outOfStock")
          ) : needsSelection ? (
            tp("selectSize")
          ) : (
            tc("addToBag")
          )}
        </button>
        <WishlistButton
          variant="button"
          item={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            image: product.image,
            price: product.price,
          }}
        />
      </div>
    </div>
  );
}
