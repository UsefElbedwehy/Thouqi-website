"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check, CheckCircle2 } from "lucide-react";
import { useCart } from "@/core/cart/store";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { placeOrder } from "@/core/orders/actions";
import { SHIPPING_METHODS, shippingPrice } from "@/core/orders/types";

const EMPTY = {
  email: "",
  phone: "",
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  area: "",
};

/** Single-page checkout: contact + address + shipping + payment + summary. */
export function CheckoutView({
  locale,
  paymentMethods,
}: {
  locale: string;
  /** Available payment methods, resolved server-side from config + key status. */
  paymentMethods: string[];
}) {
  const tco = useTranslations("checkout");
  const tcart = useTranslations("cart");
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.lines.reduce((sum, l) => sum + l.price * l.quantity, 0));
  const clear = useCart((s) => s.clear);

  const [form, setForm] = useState(EMPTY);
  const [shippingMethodId, setShippingMethodId] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<string>(paymentMethods[0] ?? "cod");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const shipping = shippingPrice(shippingMethodId);
  const total = subtotal + shipping;

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    startTransition(async () => {
      const result = await placeOrder({
        ...form,
        countryCode: "KW",
        shippingMethodId,
        paymentMethod,
        locale,
        lines: lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId,
          name: l.name,
          price: l.price,
          quantity: l.quantity,
        })),
      });
      // Online payment: hand off to the gateway (cart is cleared on return once paid).
      if (result.ok && result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
      if (result.ok && result.orderNumber) {
        setOrderNumber(result.orderNumber);
        clear();
      } else {
        setErrors(result.errors ?? {});
      }
    });
  }

  const errText = (key: string) =>
    errors[key] ? (key === "email" ? tco("invalidEmail") : tco("required")) : "";

  // Confirmation screen.
  if (orderNumber) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <CheckCircle2 className="size-14 text-success" />
        <h2 className="text-2xl font-bold">{tco("orderPlaced")}</h2>
        <p className="text-muted-foreground">{tco("thankYou")}</p>
        <p className="text-sm">
          {tco("orderNumber")}: <span className="font-semibold">{orderNumber}</span>
        </p>
        <Link href="/" className="mt-3 rounded-[--radius] bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          {tco("backToShopping")}
        </Link>
      </div>
    );
  }

  if (mounted && lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center text-muted-foreground">
        <p>{tco("emptyCart")}</p>
        <Link href="/" className="rounded-[--radius] bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          {tcart("continueShopping")}
        </Link>
      </div>
    );
  }

  const inputClass = "w-full rounded-[--radius] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";
  const field = (key: keyof typeof EMPTY, label: string, type = "text", required = true) => (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={form[key]}
        onChange={set(key)}
        required={required}
        className={cn(inputClass, errors[key] && "border-accent")}
      />
      {errText(key) && <span className="mt-1 block text-xs text-accent">{errText(key)}</span>}
    </label>
  );

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_340px]">
      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">{tco("contact")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {field("email", tco("email"), "email")}
            {field("phone", tco("phone"), "tel")}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">{tco("shippingAddress")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {field("fullName", tco("fullName"))}
            {field("city", tco("city"))}
            <div className="sm:col-span-2">{field("line1", tco("line1"))}</div>
            <div className="sm:col-span-2">{field("line2", tco("line2"), "text", false)}</div>
            {field("area", tco("area"), "text", false)}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">{tco("shippingMethod")}</h2>
          <div className="space-y-2">
            {SHIPPING_METHODS.map((m) => (
              <RadioRow
                key={m.id}
                checked={shippingMethodId === m.id}
                onSelect={() => setShippingMethodId(m.id)}
                label={tco(m.id)}
                right={formatPrice(m.price, locale)}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">{tco("payment")}</h2>
          <div className="space-y-2">
            {paymentMethods.map((p) => (
              <RadioRow
                key={p}
                checked={paymentMethod === p}
                onSelect={() => setPaymentMethod(p)}
                label={tco(p as never)}
              />
            ))}
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-[--radius] border border-border p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">{tco("orderSummary")}</h2>
        <dl className="space-y-2 text-sm">
          <Row label={tcart("subtotal")} value={formatPrice(subtotal, locale)} />
          <Row label={tco("shipping")} value={formatPrice(shipping, locale)} />
          <div className="border-t border-border pt-2">
            <Row label={tco("total")} value={formatPrice(total, locale)} strong />
          </div>
        </dl>
        <button
          type="submit"
          disabled={pending}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-[--radius] bg-primary py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? tco("placing") : tco("placeOrder")}
        </button>
      </aside>
    </form>
  );
}

function RadioRow({
  checked,
  onSelect,
  label,
  right,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
  right?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between rounded-[--radius] border px-4 py-3 text-sm",
        checked ? "border-primary bg-primary/5" : "border-border",
      )}
    >
      <span className="flex items-center gap-2">
        <span className={cn("flex size-4 items-center justify-center rounded-full border", checked ? "border-primary" : "border-border")}>
          {checked && <Check className="size-3 text-primary" />}
        </span>
        {label}
      </span>
      {right && <span className="text-muted-foreground">{right}</span>}
    </button>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between", strong && "font-semibold")}>
      <dt className={strong ? "" : "text-muted-foreground"}>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
