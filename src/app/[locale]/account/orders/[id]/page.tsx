import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getMyOrder } from "@/core/orders/service";
import { t as tr, formatPrice } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const order = await getMyOrder(id);
  if (!order) notFound();

  const t = await getTranslations("account");
  const addr = order.shippingAddress as Record<string, string> | null;

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/account/orders" className="text-sm text-muted-foreground hover:text-foreground">
            ← {t("myOrders")}
          </Link>
          <h2 className="mt-1 text-xl font-semibold">{order.reference}</h2>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.trackingNumber && (
        <p className="text-sm">
          {t("tracking")}: <span className="font-medium">{order.trackingNumber}</span>
        </p>
      )}

      <div className="divide-y divide-border border border-border">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 p-4 text-sm">
            <span>
              {tr(item.name, locale)} × {item.quantity}
            </span>
            <span className="font-medium">{formatPrice(item.unitPrice * item.quantity, locale)}</span>
          </div>
        ))}
      </div>

      <div className="ms-auto max-w-xs space-y-2 text-sm">
        <Row label={t("total")} value={formatPrice(order.grandTotal, locale)} strong />
      </div>

      {addr && (
        <div className="text-sm text-muted-foreground">
          <h3 className="mb-1 font-semibold uppercase tracking-wide text-foreground">{t("shippingTo")}</h3>
          <p>{addr.fullName}</p>
          <p>{[addr.line1, addr.line2, addr.city, addr.area].filter(Boolean).join(", ")}</p>
          <p dir="ltr">{addr.phone}</p>
        </div>
      )}
    </section>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${strong ? "font-semibold" : ""}`}>
      <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
