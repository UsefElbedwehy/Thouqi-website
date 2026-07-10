/**
 * Payment gateway abstraction.
 *
 * A `PaymentProvider` knows how to (1) initiate a hosted payment and return the
 * URL to redirect the shopper to, and (2) verify a payment's final status
 * server-side (never trusting the browser redirect). Concrete providers:
 *   - MyFatoorahProvider — real KNET/card via the MyFatoorah aggregator.
 *   - MockGatewayProvider — built-in sandbox for local/testing.
 */

export interface InitiatePaymentInput {
  orderId: string;
  reference: string;
  amountMinor: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  locale: string;
  /** Browser is redirected here after payment (we re-verify + finalize). */
  callbackUrl: string;
  /** Server-to-server confirmation endpoint (idempotent). */
  webhookUrl: string;
}

export interface InitiateResult {
  redirectUrl: string;
  paymentRef: string;
}

export type PaymentStatus = "paid" | "failed" | "pending";

export interface VerifyResult {
  status: PaymentStatus;
  gatewayRef?: string;
}

export interface PaymentProvider {
  readonly id: string;
  initiate(input: InitiatePaymentInput): Promise<InitiateResult>;
  verify(paymentRef: string): Promise<VerifyResult>;
}
