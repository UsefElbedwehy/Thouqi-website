/**
 * Payment gateway abstraction.
 *
 * A `PaymentProvider` knows how to (1) initiate a hosted payment and return the
 * URL to redirect the shopper to, and (2) verify a payment's final status
 * server-side (never trusting the browser redirect). SADAD Pay is the store's
 * only concrete provider (`SadadProvider`) — its return/webhook URLs are set
 * once in the SADAD merchant dashboard rather than passed per-invoice, so
 * they aren't part of this interface.
 */

export interface InitiatePaymentInput {
  orderId: string;
  reference: string;
  amountMinor: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  locale: string;
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
