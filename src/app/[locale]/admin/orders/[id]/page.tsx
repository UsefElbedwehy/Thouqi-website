import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getAdminOrder } from "@/core/admin/service";
import { t, formatPrice } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import type { LocalizedText } from "@/config/types";
import type { OrderStatus } from "@/core/orders/types";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { DeleteOrderButton } from "@/components/admin/DeleteOrderButton";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const items = (order.order_items as Record<string, unknown>[]) ?? [];
  const customer = order.customer as Record<string, unknown> | null;
  const addr = (order.shipping_address as Record<string, string>) ?? null;

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground">← Orders</Link>
      <div className="mb-8 mt-1 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.06em]">
          {(order.reference as string) ?? (order.id as string)}
        </h1>
        <DeleteOrderButton id={order.id as string} reference={(order.reference as string) ?? (order.id as string)} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[--radius] border border-border">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {items.map((i) => (
                  <tr key={i.id as string}>
                    <td className="p-3">
                      {t(i.name_snapshot as LocalizedText, locale)} × {i.quantity as number}
                    </td>
                    <td className="p-3 text-end font-medium">
                      {formatPrice((i.unit_price as number) * (i.quantity as number), locale)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/30 font-semibold">
                  <td className="p-3">Total</td>
                  <td className="p-3 text-end">{formatPrice(order.grand_total as number, locale)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-[--radius] border border-border p-5 text-sm">
            <h3 className="mb-2 font-semibold uppercase tracking-wide">Customer</h3>
            <p>{(customer?.full_name as string) ?? "Guest"}</p>
            {addr && (
              <>
                <p className="text-muted-foreground">{[addr.line1, addr.line2, addr.city, addr.area].filter(Boolean).join(", ")}</p>
                <p className="text-muted-foreground">{addr.email}</p>
                <p className="text-muted-foreground" dir="ltr">{addr.phone}</p>
              </>
            )}
          </div>
        </div>

        <OrderStatusForm
          id={order.id as string}
          status={order.status as OrderStatus}
          trackingNumber={(order.tracking_number as string) ?? null}
        />
      </div>
    </div>
  );
}
