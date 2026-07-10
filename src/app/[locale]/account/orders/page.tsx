import { setRequestLocale, getTranslations } from "next-intl/server";
import { listMyOrders } from "@/core/orders/service";
import { formatPrice } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const orders = await listMyOrders();

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center text-muted-foreground">
        <p>{t("noOrders")}</p>
        <Link href="/" className="rounded-[--radius] bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          {t("startShopping")}
        </Link>
      </div>
    );
  }

  const dateFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-KW" : "en-KW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <section>
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">{t("myOrders")}</h2>
      <div className="divide-y divide-border border border-border">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/account/orders/${o.id}` as never}
            className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-muted/50"
          >
            <div>
              <p className="font-semibold">{o.reference}</p>
              <p className="text-xs text-muted-foreground">
                {dateFmt.format(new Date(o.createdAt))} · {t("items")}: {o.items.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <OrderStatusBadge status={o.status} />
              <span className="text-sm font-medium">{formatPrice(o.grandTotal, locale)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
