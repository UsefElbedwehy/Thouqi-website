import { NextResponse } from "next/server";
import { SadadProvider } from "@/core/payments/providers/sadad";
import { getOrderForPayment, markOrderPaid } from "@/core/orders/service";
import { SITE_URL } from "@/lib/seo";

/**
 * Belt-and-braces fallback for the SADAD "Payment Success Return URL" /
 * "Payment Failed Return URL" (set once in the SADAD merchant dashboard —
 * SADAD's invoice API takes no per-invoice callback URL, so this can't rely
 * on a `?order=` query param the way a per-invoice redirect would).
 *
 * The webhook (/api/payments/sadad-webhook) is the authoritative source of
 * truth; this route only covers the case where the shopper's browser makes it
 * back but the webhook was delayed or missed. Exactly which query param SADAD
 * appends on redirect isn't nailed down in the integration doc, so this
 * defensively checks the common spellings — confirm the real one against a
 * sandbox test and adjust `PARAM_KEYS` below if needed.
 */
const PARAM_KEYS = ["InvoiceId", "invoiceId", "invoice_id", "id", "Key", "key"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? "ar";
  const fallback = NextResponse.redirect(`${SITE_URL}/${locale}/account/orders`);

  const invoiceId = PARAM_KEYS.map((k) => url.searchParams.get(k)).find(Boolean);
  if (!invoiceId) return fallback;

  try {
    if (!SadadProvider.isConfigured()) return fallback;

    const sadad = new SadadProvider();
    const details = await sadad.getInvoiceDetails(invoiceId);
    if (!details?.refNumber) return fallback;

    if (details.status === "paid") {
      await markOrderPaid(details.refNumber, invoiceId);
    }

    const order = await getOrderForPayment(details.refNumber);
    if (order?.reference) {
      return NextResponse.redirect(
        `${SITE_URL}/${locale}/checkout/complete?ref=${encodeURIComponent(order.reference as string)}`,
      );
    }
    return fallback;
  } catch (err) {
    console.error("[payments/sadad-return]", err);
    return fallback;
  }
}
