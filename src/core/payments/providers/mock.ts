import "server-only";
import { createSupabaseAdminClient } from "@/data/supabase/server";
import type {
  PaymentProvider,
  InitiatePaymentInput,
  InitiateResult,
  VerifyResult,
} from "../provider";
import { SITE_URL } from "@/lib/seo";

/**
 * Built-in sandbox gateway. Simulates a hosted payment page (approve/decline)
 * so the entire redirect → webhook → callback → capture flow is testable with
 * no external account. Selected via provider = "mock" in admin. `verify` reads
 * the order's persisted status (set by the webhook), mirroring how a real
 * gateway is polled.
 */
export class MockGatewayProvider implements PaymentProvider {
  readonly id = "mock";
  constructor(private secret: string) {}

  async initiate(input: InitiatePaymentInput): Promise<InitiateResult> {
    // paymentRef = orderId keeps verify() a simple status lookup.
    const params = new URLSearchParams({
      order: input.orderId,
      ref: input.reference,
      amount: String(input.amountMinor),
      callback: input.callbackUrl,
      webhook: input.webhookUrl,
      secret: this.secret,
    });
    return {
      redirectUrl: `${SITE_URL}/api/payments/mock-gateway?${params.toString()}`,
      paymentRef: input.orderId,
    };
  }

  async verify(paymentRef: string): Promise<VerifyResult> {
    const db = createSupabaseAdminClient();
    const { data } = await db
      .from("orders")
      .select("status")
      .eq("id", paymentRef)
      .maybeSingle();
    const status = (data?.status as string) ?? "";
    if (status === "paid" || status === "shipped" || status === "delivered") {
      return { status: "paid" };
    }
    if (status === "cancelled") return { status: "failed" };
    return { status: "pending" };
  }
}
