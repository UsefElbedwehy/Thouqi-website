import "server-only";
import type {
  PaymentProvider,
  InitiatePaymentInput,
  InitiateResult,
  VerifyResult,
} from "../provider";

/**
 * MyFatoorah provider — the standard aggregator for KNET + cards in Kuwait.
 *
 * Production-ready: it calls the real SendPayment / getPaymentStatus endpoints
 * with the merchant API token stored in `payment_settings`. It runs as soon as
 * the client supplies their key (test or live) and the provider is selected in
 * admin. Docs: https://docs.myfatoorah.com/
 */
export class MyFatoorahProvider implements PaymentProvider {
  readonly id = "myfatoorah";
  private baseUrl: string;

  constructor(
    private apiKey: string,
    testMode: boolean,
  ) {
    // Kuwait endpoints. Test = apitest, live = api.
    this.baseUrl = testMode ? "https://apitest.myfatoorah.com" : "https://api.myfatoorah.com";
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async initiate(input: InitiatePaymentInput): Promise<InitiateResult> {
    const res = await fetch(`${this.baseUrl}/v2/SendPayment`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        CustomerName: input.customerName || "Customer",
        NotificationOption: "LNK",
        InvoiceValue: input.amountMinor / 1000, // KWD minor units → decimal
        DisplayCurrencyIso: input.currency,
        CustomerEmail: input.customerEmail || undefined,
        CallBackUrl: input.callbackUrl,
        ErrorUrl: input.callbackUrl,
        Language: input.locale === "ar" ? "ar" : "en",
        CustomerReference: input.reference,
        // KNET is invoice payment method id 1 in KW; leaving it to the hosted
        // page lets the shopper choose KNET or card.
      }),
    });

    const json = (await res.json()) as {
      IsSuccess?: boolean;
      Message?: string;
      Data?: { InvoiceURL?: string; InvoiceId?: number };
    };
    if (!res.ok || !json.IsSuccess || !json.Data?.InvoiceURL) {
      throw new Error(`MyFatoorah SendPayment failed: ${json.Message ?? res.status}`);
    }
    return {
      redirectUrl: json.Data.InvoiceURL,
      paymentRef: String(json.Data.InvoiceId ?? ""),
    };
  }

  async verify(paymentRef: string): Promise<VerifyResult> {
    const res = await fetch(`${this.baseUrl}/v2/getPaymentStatus`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ Key: paymentRef, KeyType: "InvoiceId" }),
    });
    const json = (await res.json()) as {
      IsSuccess?: boolean;
      Data?: { InvoiceStatus?: string; InvoiceTransactions?: { TransactionId?: string }[] };
    };
    const status = json.Data?.InvoiceStatus ?? "";
    const gatewayRef = json.Data?.InvoiceTransactions?.[0]?.TransactionId;
    if (status === "Paid") return { status: "paid", gatewayRef };
    if (status === "Failed" || status === "Expired") return { status: "failed", gatewayRef };
    return { status: "pending", gatewayRef };
  }
}
