import { NextResponse } from "next/server";
import { getPaymentSecret } from "@/core/payments/service";
import { markOrderPaid } from "@/core/orders/service";

/**
 * Payment webhook — the authoritative, idempotent server-to-server confirmation.
 * The shared secret (the stored gateway key) authenticates the caller; the
 * sandbox gateway posts here, and it's where a real gateway's IPN would land.
 * Marks the order paid (pending → paid only, so retries are safe).
 */
export async function POST(request: Request) {
  let body: { orderId?: string; secret?: string; status?: string; gatewayRef?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const { key } = await getPaymentSecret();
  if (!key || body.secret !== key) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!body.orderId) {
    return NextResponse.json({ ok: false, error: "missing_order" }, { status: 400 });
  }
  if (body.status && body.status !== "paid") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const changed = await markOrderPaid(body.orderId, body.gatewayRef);
  return NextResponse.json({ ok: true, changed });
}
