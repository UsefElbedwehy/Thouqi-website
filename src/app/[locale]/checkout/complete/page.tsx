import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CheckCircle2, Clock } from "lucide-react";
import { getOrderStatusByRef } from "@/core/orders/service";
import { formatPrice } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ClearCartOnPaid } from "@/components/checkout/ClearCartOnPaid";

export const metadata: Metadata = { robots: { index: false } };

export default async function CheckoutCompletePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { ref } = await searchParams;
  const tco = await getTranslations("checkout");

  const order = ref ? await getOrderStatusByRef(ref) : null;
  const paid = order ? ["paid", "shipped", "delivered"].includes(order.status as string) : false;

  return (
    <Container className="flex flex-col items-center gap-4 py-20 text-center">
      {paid && <ClearCartOnPaid />}
      {paid ? (
        <>
          <CheckCircle2 className="size-14 text-success" />
          <h1 className="text-2xl font-bold">{tco("orderPlaced")}</h1>
          <p className="text-muted-foreground">{tco("thankYou")}</p>
        </>
      ) : (
        <>
          <Clock className="size-14 text-muted-foreground" />
          <h1 className="text-2xl font-bold">{tco("paymentPending")}</h1>
          <p className="max-w-md text-muted-foreground">{tco("paymentPendingBody")}</p>
        </>
      )}

      {order && (
        <p className="text-sm">
          {tco("orderNumber")}: <span className="font-semibold">{order.reference as string}</span>
          {" · "}
          {formatPrice(order.grand_total as number, locale)}
        </p>
      )}

      <div className="mt-3 flex gap-3">
        <Link href="/" className="rounded-[--radius] bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          {tco("backToShopping")}
        </Link>
        <Link href="/account/orders" className="rounded-[--radius] border border-border px-6 py-2.5 text-sm hover:border-primary">
          {tco("orderNumber")}
        </Link>
      </div>
    </Container>
  );
}
