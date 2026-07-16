import "server-only";
import type {
  PaymentProvider,
  InitiatePaymentInput,
  InitiateResult,
  VerifyResult,
} from "../provider";

/**
 * SADAD Pay (Kuwait) — hosted checkout for KNET, Visa/Mastercard, and Apple Pay
 * via sadadpay.net. Two-step auth (client key + secret → refresh token → access
 * token, cached in-process); invoices are created server-side with the
 * server-computed order total (never a client-supplied amount).
 *
 * SADAD is the only gateway this store integrates, and its credentials live
 * exclusively in environment variables (SADAD_CLIENT_KEY, SADAD_SECRET_KEY,
 * optional SADAD_BASE_URL for sandbox testing) — never in the database or an
 * admin-editable field, so they never pass through the app's own auth surface.
 *
 * `ref_Number` on the invoice is set to our internal order id, so a webhook
 * carrying only `InvoiceId` can resolve back to `getInvoiceDetails().refNumber`
 * without a separate lookup. Docs: https://sadadpay.net (merchant dashboard).
 */
export class SadadProvider implements PaymentProvider {
  readonly id = "sadad";
  private clientKey: string;
  private secretKey: string;
  private baseUrl: string;
  private payHost: string;

  // Module-level cache: warm serverless instances reuse the access token
  // instead of re-authenticating on every request. Doesn't persist across
  // cold starts, but that's fine — auth is cheap and this just saves the
  // common case.
  private static cached: { token: string; exp: number } | null = null;

  constructor() {
    // A stray newline from pasting/env-loading breaks Basic auth silently and
    // surfaces as the same WrongClientKeyOrClientSecret error as a bad key.
    this.clientKey = (process.env.SADAD_CLIENT_KEY ?? "").trim();
    this.secretKey = (process.env.SADAD_SECRET_KEY ?? "").trim();
    this.baseUrl = (process.env.SADAD_BASE_URL ?? "https://api.sadadpay.net").trim();
    this.payHost = this.baseUrl.includes("sandbox") ? "https://sandbox.sadadpay.net" : "https://sadadpay.net";
  }

  /** True once both credentials are present — checked before ever constructing a provider. */
  static isConfigured(): boolean {
    return !!process.env.SADAD_CLIENT_KEY?.trim() && !!process.env.SADAD_SECRET_KEY?.trim();
  }

  /** Read-only status for the admin UI — never exposes the actual secret values. */
  static status(): { hasClientKey: boolean; hasSecretKey: boolean; isSandbox: boolean; baseUrl: string } {
    const baseUrl = (process.env.SADAD_BASE_URL ?? "https://api.sadadpay.net").trim();
    return {
      hasClientKey: !!process.env.SADAD_CLIENT_KEY?.trim(),
      hasSecretKey: !!process.env.SADAD_SECRET_KEY?.trim(),
      isSandbox: baseUrl.includes("sandbox"),
      baseUrl,
    };
  }

  /** Basic → refresh token → access token. Auth failures come back as HTTP 200
   *  with `isValid: false`, so the body is always checked — never `res.ok`. */
  private async accessToken(): Promise<string> {
    const now = Date.now();
    if (SadadProvider.cached && SadadProvider.cached.exp > now + 60_000) {
      return SadadProvider.cached.token;
    }

    // A stray newline from pasting/env-loading breaks Basic auth silently and
    // surfaces as the same WrongClientKeyOrClientSecret error as a bad key.
    const key = this.clientKey.trim();
    const secret = this.secretKey.trim();
    if (!key || !secret) throw new Error("sadad_keys_missing");

    const basic = Buffer.from(`${key}:${secret}`).toString("base64");
    const r1 = await fetch(`${this.baseUrl}/api/User/GenerateRefreshToken`, {
      method: "POST",
      headers: { Authorization: `Basic ${basic}` },
    });
    const j1 = await r1.json().catch(() => null);
    const refreshToken = j1?.response?.refreshToken;
    if (!refreshToken) throw new Error(`sadad_auth_failed: ${j1?.errorKey ?? "no_refresh_token"}`);

    const r2 = await fetch(`${this.baseUrl}/api/User/GenerateAccessToken`, {
      method: "POST",
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    const j2 = await r2.json().catch(() => null);
    const accessToken = j2?.response?.accessToken;
    if (!accessToken) throw new Error(`sadad_auth_failed: ${j2?.errorKey ?? "no_access_token"}`);

    SadadProvider.cached = {
      token: accessToken,
      exp: now + (j2.response.expiredAfterSeconds ?? 86400) * 1000,
    };
    return accessToken;
  }

  private async getInvoice(invoiceId: string, token: string) {
    const res = await fetch(`${this.baseUrl}/api/Invoice/getbyid?id=${encodeURIComponent(invoiceId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json().catch(() => null);
  }

  async initiate(input: InitiatePaymentInput): Promise<InitiateResult> {
    const token = await this.accessToken();

    // amountMinor is fils (KWD × 1000, see lib/format.ts); SADAD wants a
    // decimal-KWD string with exactly 3 decimals, e.g. "39.000".
    const amount = (input.amountMinor / 1000).toFixed(3);

    const res = await fetch(`${this.baseUrl}/api/Invoice/insert`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        Invoices: [
          {
            // Our internal order id, not the human-readable reference — this
            // is what the webhook gets back to resolve the order with no
            // extra lookup (see getInvoiceDetails()).
            ref_Number: input.orderId,
            amount,
            customer_Name: input.customerName || "Customer",
            customer_Email: input.customerEmail || "noreply@example.com",
            customer_Mobile: "",
            lang: input.locale === "ar" ? "ar" : "en",
            currency_Code: input.currency,
          },
        ],
      }),
    });
    const insertBody = await res.json().catch(() => null);
    const invoiceId = insertBody?.response?.invoiceId;
    if (!invoiceId) {
      throw new Error(`sadad_invoice_failed: ${insertBody?.errorKey ?? res.status}`);
    }

    const info = await this.getInvoice(String(invoiceId), token);
    const url: string | undefined =
      info?.response?.url ?? (info?.response?.key ? `${this.payHost}/pay/${info.response.key}` : undefined);
    if (!url) throw new Error("sadad_no_payment_url");

    return { redirectUrl: url, paymentRef: String(invoiceId) };
  }

  async verify(paymentRef: string): Promise<VerifyResult> {
    const token = await this.accessToken();
    const info = await this.getInvoice(paymentRef, token);
    const status = String(info?.response?.status ?? "").toLowerCase();
    const gatewayRef = info?.response?.paymentGatewayCode as string | undefined;
    if (status === "paid") return { status: "paid", gatewayRef };
    if (status === "expired" || status === "failed" || status === "cancelled") {
      return { status: "failed", gatewayRef };
    }
    return { status: "pending", gatewayRef };
  }

  /**
   * Full invoice details including `ref_Number` (our order id) — needed by
   * the webhook route, which only receives an invoiceId and must resolve
   * order identity itself. Always re-verifies against SADAD; never trusts
   * the webhook body's claimed status.
   */
  async getInvoiceDetails(
    invoiceId: string,
  ): Promise<{ status: VerifyResult["status"]; refNumber: string | null; gatewayCode: string | null } | null> {
    const token = await this.accessToken();
    const info = await this.getInvoice(invoiceId, token);
    const raw = String(info?.response?.status ?? "").toLowerCase();
    if (!raw) return null;
    const status: VerifyResult["status"] =
      raw === "paid" ? "paid" : raw === "expired" || raw === "failed" || raw === "cancelled" ? "failed" : "pending";
    return {
      status,
      refNumber: info?.response?.ref_Number ?? null,
      gatewayCode: info?.response?.paymentGatewayCode ?? null,
    };
  }
}
