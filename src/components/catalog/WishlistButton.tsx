"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { useWishlist, type WishlistItem } from "@/core/wishlist/store";
import { setWishlistItemAction } from "@/core/wishlist/actions";
import { cn } from "@/lib/utils";

/**
 * Heart toggle for wishlisting a product. Works embedded in server components
 * (e.g. ProductCard). Two variants: a compact icon (`icon`) for cards and a
 * labelled button (`button`) for the PDP.
 */
export function WishlistButton({
  item,
  variant = "icon",
  className,
}: {
  item: WishlistItem;
  variant?: "icon" | "button";
  className?: string;
}) {
  const tc = useTranslations("common");
  const toggle = useWishlist((s) => s.toggle);
  const inList = useWishlist((s) => s.items.some((i) => i.productId === item.productId));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const active = mounted && inList;

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(item);
    // Best-effort: syncs for signed-in users, silently no-ops for guests.
    setWishlistItemAction(item.productId, !inList).catch(() => {});
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
          "flex items-center gap-2 rounded-[--radius] border px-4 py-3 text-sm hover:border-primary",
          active ? "border-primary text-primary" : "border-border",
          className,
        )}
      >
        <Heart className={cn("size-4", active && "fill-current")} />
        <span className="hidden sm:inline">{tc("addToWishlist")}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={tc("addToWishlist")}
      aria-pressed={active}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:text-primary",
        active ? "text-primary" : "text-foreground",
        className,
      )}
    >
      <Heart className={cn("size-4", active && "fill-current")} />
    </button>
  );
}
