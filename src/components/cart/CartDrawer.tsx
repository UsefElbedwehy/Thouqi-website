"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "@/core/cart/store";
import { useUI } from "@/core/ui/store";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CartLineRow } from "./CartLineRow";

/**
 * Slide-over cart drawer. Opens on add-to-bag or the header bag button.
 * Anchored to the inline-end edge so it slides from the correct side in RTL.
 */
export function CartDrawer({ locale }: { locale: string }) {
  const tcart = useTranslations("cart");
  const open = useUI((s) => s.cartOpen);
  const close = useUI((s) => s.closeCart);
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.lines.reduce((sum, l) => sum + l.price * l.quantity, 0));

  // Lock body scroll + close on Escape while open.
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

  return (
    <>
      <div
        aria-hidden={!open}
        onClick={close}
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={tcart("title")}
        className={cn(
          "glass-strong fixed inset-y-0 end-0 z-50 flex w-full max-w-sm flex-col transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide">{tcart("title")}</h2>
          <button type="button" onClick={close} aria-label="Close">
            <X className="size-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
            <ShoppingBag className="size-10 opacity-40" />
            <p>{tcart("empty")}</p>
            <button onClick={close} className="text-sm text-primary hover:underline">
              {tcart("continueShopping")}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-border overflow-y-auto px-4">
              {lines.map((line) => (
                <CartLineRow key={`${line.productId}-${line.variantId ?? ""}`} line={line} locale={locale} />
              ))}
            </div>
            <div className="border-t border-border p-4">
              <div className="mb-3 flex items-center justify-between text-sm font-medium">
                <span>{tcart("subtotal")}</span>
                <span>{formatPrice(subtotal, locale)}</span>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={close}
                  className="rounded-[--radius] bg-primary py-3 text-center text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90"
                >
                  {tcart("checkout")}
                </Link>
                <Link
                  href="/cart"
                  onClick={close}
                  className="rounded-[--radius] border border-border py-2.5 text-center text-sm hover:border-primary"
                >
                  {tcart("viewBag")}
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
