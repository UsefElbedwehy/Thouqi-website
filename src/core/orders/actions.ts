"use server";

import { checkoutSchema } from "./schema";
import { createOrder, setOrderPaymentRef } from "./service";
import { getCurrentUser } from "@/core/auth/user";
import { getSiteConfig } from "@/config";
import { resolveCheckoutMethods } from "@/core/payments/service";
import { getProvider } from "@/core/payments/gateway";
import { shippingPrice } from "./types";
import { SITE_URL } from "@/lib/seo";
import type { PlaceOrderResult } from "./types";

/**
 * Place an order.
 *
 * Server Action = the trusted boundary. Validates with Zod, then delegates to
 * the orders service which re-prices server-side, persists the order + items,
 * and returns a reference. Attaches the signed-in customer when present
 * (guest checkout otherwise).
 */
export async function placeOrder(raw: unknown): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }

  // Reject a payment method that isn't actually available (e.g. an online
  // method chosen while payments are switched off or no key is configured).
  const config = await getSiteConfig();
  const allowed = await resolveCheckoutMethods(config);
  if (!allowed.includes(parsed.data.paymentMethod)) {
    return { ok: false, errors: { paymentMethod: "unavailable" } };
  }

  try {
    const user = await getCurrentUser();
    const { id, reference } = await createOrder(parsed.data, user?.id ?? null);

    // Cash on Delivery: order is confirmed immediately, no gateway.
    if (parsed.data.paymentMethod === "cod") {
      return { ok: true, orderNumber: reference };
    }

    // Online payment: initiate a hosted payment and hand back the redirect URL.
    const provider = await getProvider(config);
    if (!provider) {
      // Online was gated away but the key vanished — leave the order pending.
      return { ok: true, orderNumber: reference };
    }
    const locale = parsed.data.locale ?? "ar";
    // Charge the grand total (items + shipping), not just the subtotal.
    const subtotal = parsed.data.lines.reduce((s, l) => s + l.price * l.quantity, 0);
    const grandTotal = subtotal + shippingPrice(parsed.data.shippingMethodId);
    const init = await provider.initiate({
      orderId: id,
      reference,
      amountMinor: grandTotal,
      currency: config.commerce.currencyCode,
      customerName: parsed.data.fullName,
      customerEmail: parsed.data.email,
      locale,
      callbackUrl: `${SITE_URL}/api/payments/callback?order=${id}&locale=${locale}`,
      webhookUrl: `${SITE_URL}/api/payments/webhook`,
    });
    await setOrderPaymentRef(id, init.paymentRef, provider.id);
    return { ok: true, orderNumber: reference, redirectUrl: init.redirectUrl };
  } catch (err) {
    console.error("[placeOrder]", err);
    return { ok: false, errors: { form: "server" } };
  }
}
