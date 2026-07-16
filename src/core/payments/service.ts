import "server-only";
import type { SiteConfig } from "@/config/types";
import { SadadProvider } from "./providers/sadad";

/**
 * Payments service.
 *
 * `config.payments` (public) decides WHICH methods appear at checkout. SADAD
 * is the store's only gateway, and its credentials live exclusively in
 * environment variables (SADAD_CLIENT_KEY / SADAD_SECRET_KEY) — never in the
 * database or an admin form. Online methods (knet/card) are only offered when
 * online payment is switched on AND both env vars are set, so the store is
 * deployable COD-only until they're added.
 */
export type PaymentMethodId = "cod" | "knet" | "card";

export const PAYMENT_METHOD_KEYS: Record<PaymentMethodId, string> = {
  cod: "checkout.cod",
  knet: "checkout.knet",
  card: "checkout.card",
};

/** Online payment is usable only when enabled in config AND SADAD's env vars are set. */
export async function isOnlineReady(config: SiteConfig): Promise<boolean> {
  if (!config.payments.onlineEnabled) return false;
  return SadadProvider.isConfigured();
}

/** The payment methods to offer at checkout for the current configuration. */
export async function resolveCheckoutMethods(config: SiteConfig): Promise<PaymentMethodId[]> {
  const online = await isOnlineReady(config);
  const out: PaymentMethodId[] = [];
  if (config.payments.methods.cod) out.push("cod");
  if (online && config.payments.methods.knet) out.push("knet");
  if (online && config.payments.methods.card) out.push("card");
  // Never leave checkout with zero methods.
  if (out.length === 0) out.push("cod");
  return out;
}
