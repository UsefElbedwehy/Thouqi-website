import "server-only";
import type { SiteConfig } from "@/config/types";
import type { PaymentProvider } from "./provider";
import { getPaymentSecret } from "./service";
import { MockGatewayProvider } from "./providers/mock";
import { MyFatoorahProvider } from "./providers/myfatoorah";
import { SadadProvider } from "./providers/sadad";

/**
 * Resolve the active payment provider for online checkout, or null when online
 * payment isn't ready (switched off or a required credential is missing). Keeps
 * provider selection in one place so routes/actions stay provider-agnostic.
 */
export async function getProvider(config: SiteConfig): Promise<PaymentProvider | null> {
  if (!config.payments.onlineEnabled) return null;
  const { key, secret, provider, testMode } = await getPaymentSecret();
  if (!key) return null;

  if (provider === "mock") return new MockGatewayProvider(key);
  if (provider === "sadad") {
    if (!secret) return null;
    return new SadadProvider(key, secret, testMode);
  }
  // "knet" and "myfatoorah" both route through MyFatoorah (KNET is a method there).
  return new MyFatoorahProvider(key, testMode);
}
