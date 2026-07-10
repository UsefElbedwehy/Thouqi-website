import { NextResponse } from "next/server";
import { getSiteConfig } from "@/config";
import { getProvider } from "@/core/payments/gateway";
import { getOrderForPayment, markOrderPaid } from "@/core/orders/service";
import { SITE_URL } from "@/lib/seo";

/**
 * Payment callback — where the gateway returns the shopper's browser after the
 * hosted payment. We RE-VERIFY the status server-side (never trust the redirect)
 * and finalize, then redirect to the confirmation page.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("order") ?? "";
  const locale = url.searchParams.get("locale") ?? "ar";

  const complete = (ref: string) =>
    NextResponse.redirect(`${SITE_URL}/${locale}/checkout/complete?ref=${encodeURIComponent(ref)}`);

  const order = await getOrderForPayment(orderId);
  if (!order) return NextResponse.redirect(`${SITE_URL}/${locale}`);

  try {
    const config = await getSiteConfig();
    const provider = await getProvider(config);
    if (provider && order.payment_ref) {
      const result = await provider.verify(order.payment_ref as string);
      if (result.status === "paid") {
        await markOrderPaid(order.id as string, result.gatewayRef);
      }
    }
  } catch (err) {
    console.error("[payments/callback]", err);
  }

  return complete(order.reference as string);
}
