import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Product } from "@/core/catalog/types";
import { t, formatPrice } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { getAssets } from "@/config";
import { WishlistButton } from "./WishlistButton";
import { QuickAddButton } from "./QuickAddButton";

/**
 * Premium product card: tall editorial image with a slow hover zoom, a
 * wishlist heart, a quick-add overlay revealed on hover, and refined typography
 * (brand in tracked caps, name, price with sale handling).
 */
export async function ProductCard({
  product,
  locale,
}: {
  product: Product;
  locale: string;
}) {
  const tp = await getTranslations("product");
  const assets = getAssets();
  const image = product.images[0]?.url ?? assets.placeholders.product;
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;
  // Items with size options can't be quick-added — the customer must pick a size on the PDP.
  const requiresSize = product.variants.some((v) => "size" in (v.options ?? {}));
  const lineItem = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand.name,
    image,
    price: product.price,
  };

  return (
    <div className="group">
      <Link href={`/p/${product.slug}` as never} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted shadow-[0_2px_8px_-4px_rgba(0,0,0,0)] transition-shadow duration-500 group-hover:shadow-[0_24px_40px_-16px_rgba(0,0,0,0.22)]">
          <Image
            src={image}
            alt={t(product.images[0]?.alt ?? product.name, locale)}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
          />

          {onSale && (
            <span className="absolute start-3 top-3 bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground">
              {tp("now")}
            </span>
          )}

          <div className="absolute end-3 top-3 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-within:opacity-100">
            <WishlistButton item={lineItem} />
          </div>

          {/* Quick add — slides up on hover. Size items show a "Choose size" cue instead. */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
            {requiresSize ? (
              <div className="glass-strong w-full border-x-0 border-b-0 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
                {tp("chooseSize")}
              </div>
            ) : (
              <QuickAddButton item={lineItem} />
            )}
          </div>
        </div>
      </Link>

      <Link href={`/p/${product.slug}` as never} className="mt-3.5 block">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">
          {t(product.brand.name, locale)}
        </p>
        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{t(product.name, locale)}</p>

        <div className="mt-1.5 flex items-center gap-2 text-sm">
          {onSale ? (
            <>
              <span className="text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice!, locale)}
              </span>
              <span className="font-semibold text-accent">{formatPrice(product.price, locale)}</span>
            </>
          ) : (
            <span className="font-medium text-foreground">{formatPrice(product.price, locale)}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
