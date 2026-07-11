import { NextResponse } from "next/server";
import { getPaymentSecret } from "@/core/payments/service";
import { SadadProvider } from "@/core/payments/providers/sadad";
import { markOrderPaid } from "@/core/orders/service";

/**
 * SADAD Pay server-to-server confirmation (IPN). This route sits outside the
 * i18n/auth middleware (see `middleware.ts`'s matcher, which excludes /api) so
 * it's publicly reachable with no auth gate — SADAD's webhook call carries no
 * auth header of its own. Set this as the WebhookURL in the SADAD dashboard:
 * https://yoursite.com/api/payments/sadad-webhook
 *
 * The POST body is never trusted for the payment status: it's only used to
 * look up the invoice, which is then re-verified against SADAD directly.
 * Always responds 200 (including on errors) so SADAD doesn't retry forever.
 */
export async function POST(request: Request) {
  let body: { InvoiceId?: number | string; invoiceId?: number | string } | null = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const invoiceId = body?.InvoiceId ?? body?.invoiceId;
  if (!invoiceId) return NextResponse.json({ ok: true });

  try {
    const { key, secret, provider, testMode } = await getPaymentSecret();
    if (provider !== "sadad" || !key || !secret) return NextResponse.json({ ok: true });

    const sadad = new SadadProvider(key, secret, testMode);
    const details = await sadad.getInvoiceDetails(String(invoiceId));
    if (details?.status === "paid" && details.refNumber) {
      // markOrderPaid only transitions pending -> paid, so SADAD's webhook
      // retries are safe to process more than once.
      await markOrderPaid(details.refNumber, String(invoiceId));
    }
  } catch (err) {
    console.error("[payments/sadad-webhook]", err);
  }

  return NextResponse.json({ ok: true });
}
