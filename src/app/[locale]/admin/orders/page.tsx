import { setRequestLocale } from "next-intl/server";
import { listAdminOrders } from "@/core/admin/service";
import { formatPrice } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { DeleteOrderButton } from "@/components/admin/DeleteOrderButton";

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const orders = await listAdminOrders();

  const dateFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-KW" : "en-KW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold uppercase tracking-[0.06em]">Orders</h1>
      <div className="overflow-hidden rounded-[--radius] border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 text-start font-medium">Reference</th>
              <th className="p-3 text-start font-medium">Customer</th>
              <th className="p-3 text-start font-medium">Date</th>
              <th className="p-3 text-start font-medium">Status</th>
              <th className="p-3 text-start font-medium">Total</th>
              <th className="p-3 text-end font-medium">&nbsp;</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-muted/30">
                <td className="p-3">
                  <Link href={`/admin/orders/${o.id}` as never} className="font-medium hover:text-primary">
                    {o.reference}
                  </Link>
                  <span className="block text-xs text-muted-foreground">{o.itemCount} items</span>
                </td>
                <td className="p-3 text-muted-foreground">{o.customerName ?? "Guest"}</td>
                <td className="p-3 text-muted-foreground">{dateFmt.format(new Date(o.createdAt))}</td>
                <td className="p-3"><OrderStatusBadge status={o.status} /></td>
                <td className="p-3 font-medium">{formatPrice(o.grandTotal, locale)}</td>
                <td className="p-3 text-end">
                  <DeleteOrderButton id={o.id} reference={o.reference} compact />
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
