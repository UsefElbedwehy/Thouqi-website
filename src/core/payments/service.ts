import "server-only";
import { createSupabaseAdminClient } from "@/data/supabase/server";
import type { SiteConfig } from "@/config/types";

/**
 * Payments service.
 *
 * Two concerns are kept apart:
 *  - PUBLIC config (`config.payments`) decides WHICH methods appear at checkout.
 *  - The gateway SECRET (api key) lives in the server-only `payment_settings`
 *    table and is only ever read here (service role). It never reaches config
 *    or the client.
 *
 * Online methods (knet/card) are only offered when online payment is switched
 * on AND a key is present — so the store is deployable COD-only until the
 * client's key is added in admin.
 */
export type PaymentMethodId = "cod" | "knet" | "card";

export const PAYMENT_METHOD_KEYS: Record<PaymentMethodId, string> = {
  cod: "checkout.cod",
  knet: "checkout.knet",
  card: "checkout.card",
};

export interface PaymentSecretStatus {
  provider: string | null;
  hasKey: boolean;
  /** SADAD (and any future two-credential gateway) needs a second secret key. */
  hasSecret: boolean;
  testMode: boolean;
}

export async function getPaymentSecretStatus(): Promise<PaymentSecretStatus> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("payment_settings")
    .select("provider, api_key, api_secret, test_mode")
    .eq("id", true)
    .maybeSingle();
  return {
    provider: (data?.provider as string) ?? null,
    hasKey: !!data?.api_key,
    hasSecret: !!data?.api_secret,
    testMode: (data?.test_mode as boolean) ?? true,
  };
}

/** Raw gateway secret(s) — SERVER ONLY, used to construct the provider. */
export async function getPaymentSecret(): Promise<{
  key: string | null;
  secret: string | null;
  provider: string | null;
  testMode: boolean;
}> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("payment_settings")
    .select("provider, api_key, api_secret, test_mode")
    .eq("id", true)
    .maybeSingle();
  return {
    key: (data?.api_key as string) ?? null,
    secret: (data?.api_secret as string) ?? null,
    provider: (data?.provider as string) ?? null,
    testMode: (data?.test_mode as boolean) ?? true,
  };
}

/**
 * Online payment is usable only when enabled in config AND its required
 * credential(s) are stored. SADAD needs both a client key and a secret key;
 * other providers only need the single key.
 */
export async function isOnlineReady(config: SiteConfig): Promise<boolean> {
  if (!config.payments.onlineEnabled) return false;
  const { provider, hasKey, hasSecret } = await getPaymentSecretStatus();
  if (!hasKey) return false;
  if (provider === "sadad") return hasSecret;
  return true;
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
