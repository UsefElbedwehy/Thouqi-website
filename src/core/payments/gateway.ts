import "server-only";
import type { SiteConfig } from "@/config/types";
import type { PaymentProvider } from "./provider";
import { getPaymentSecret } from "./service";
import { MockGatewayProvider } from "./providers/mock";
import { MyFatoorahProvider } from "./providers/myfatoorah";

/**
 * Resolve the active payment provider for online checkout, or null when online
 * payment isn't ready (switched off or no key). Keeps provider selection in one
 * place so routes/actions stay provider-agnostic.
 */
export async function getProvider(config: SiteConfig): Promise<PaymentProvider | null> {
  if (!config.payments.onlineEnabled) return null;
  const { key, provider, testMode } = await getPaymentSecret();
  if (!key) return null;

  if (provider === "mock") return new MockGatewayProvider(key);
  // "knet" and "myfatoorah" both route through MyFatoorah (KNET is a method there).
  return new MyFatoorahProvider(key, testMode);
}
