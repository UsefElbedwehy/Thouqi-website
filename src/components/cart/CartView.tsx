"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/core/cart/store";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { CartLineRow } from "./CartLineRow";

/** Full shopping-bag page. Client-rendered from the persisted cart store. */
export function CartView({ locale }: { locale: string }) {
  const tcart = useTranslations("cart");
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.lines.reduce((sum, l) => sum + l.price * l.quantity, 0));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <ShoppingBag className="size-12 text-muted-foreground opacity-40" />
        <p className="text-muted-foreground">{tcart("empty")}</p>
        <Link href="/" className="rounded-[--radius] bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          {tcart("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div className="divide-y divide-border">
        {lines.map((line) => (
          <CartLineRow key={`${line.productId}-${line.variantId ?? ""}`} line={line} locale={locale} />
        ))}
      </div>

      <aside className="h-fit rounded-[--radius] border border-border p-5">
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{tcart("subtotal")}</span>
          <span className="font-semibold">{formatPrice(subtotal, locale)}</span>
        </div>
        <Link
          href="/checkout"
          className="block rounded-[--radius] bg-primary py-3 text-center text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90"
        >
          {tcart("checkout")}
        </Link>
        <Link href="/" className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground">
          {tcart("continueShopping")}
        </Link>
      </aside>
    </div>
  );
}
