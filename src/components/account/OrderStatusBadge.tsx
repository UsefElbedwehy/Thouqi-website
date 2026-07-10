import { getTranslations } from "next-intl/server";
import type { OrderStatus } from "@/core/orders/types";
import { cn } from "@/lib/utils";

const styles: Record<OrderStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  paid: "bg-foreground text-background",
  shipped: "bg-gold/20 text-foreground",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-accent/10 text-accent",
  refunded: "bg-accent/10 text-accent",
};

const labelKey: Record<OrderStatus, string> = {
  pending: "statusPending",
  paid: "statusPaid",
  shipped: "statusShipped",
  delivered: "statusDelivered",
  cancelled: "statusCancelled",
  refunded: "statusRefunded",
};

export async function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = await getTranslations("account");
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]",
        styles[status],
      )}
    >
      {t(labelKey[status] as never)}
    </span>
  );
}
