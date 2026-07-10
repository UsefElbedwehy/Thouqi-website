"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, X } from "lucide-react";
import { useWishlist } from "@/core/wishlist/store";
import { setWishlistItemAction } from "@/core/wishlist/actions";
import { useCart } from "@/core/cart/store";
import { useUI } from "@/core/ui/store";
import { Link } from "@/i18n/navigation";
import { t, formatPrice } from "@/lib/format";
import { defaultAssets } from "@/config/assets.config";
import { ProductGridSkeleton } from "@/components/catalog/ProductCardSkeleton";

/** Wishlist grid rendered from the persisted wishlist store. */
export function WishlistView({ locale }: { locale: string }) {
  const tw = useTranslations("wishlist");
  const tc = useTranslations("common");
  const items = useWishlist((s) => s.items);
  const removeWish = useWishlist((s) => s.remove);
  const addToCart = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <ProductGridSkeleton count={8} />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <Heart className="size-10 text-muted-foreground/40" strokeWidth={1.25} />
        <p className="text-muted-foreground">{tw("empty")}</p>
        <Link href="/" className="rounded-[--radius] bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          {tw("browse")}
        </Link>
      </div>
    );
  }

  const placeholder = defaultAssets.placeholders.product;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.productId} className="group">
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            <Link href={`/p/${item.slug}` as never}>
              <Image
                src={item.image ?? placeholder}
                alt={t(item.name, locale)}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
            <button
              type="button"
              onClick={() => {
                removeWish(item.productId);
                setWishlistItemAction(item.productId, false).catch(() => {});
              }}
              aria-label={tc("close")}
              className="absolute end-2 top-2 flex size-8 items-center justify-center rounded-full bg-background/80 backdrop-blur hover:text-accent"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide">{t(item.brand, locale)}</p>
            <p className="line-clamp-1 text-sm text-muted-foreground">{t(item.name, locale)}</p>
            <p className="mt-1 text-sm font-medium">{formatPrice(item.price, locale)}</p>
            <button
              type="button"
              onClick={() => {
                addToCart({
                  productId: item.productId,
                  slug: item.slug,
                  name: item.name,
                  brand: item.brand,
                  image: item.image,
                  price: item.price,
                });
                openCart();
              }}
              className="mt-2 w-full rounded-[--radius] border border-border py-2 text-xs font-semibold uppercase tracking-wide hover:border-primary hover:text-primary"
            >
              {tw("moveToBag")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
