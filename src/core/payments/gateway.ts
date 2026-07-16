import "server-only";
import type { SiteConfig } from "@/config/types";
import type { PaymentProvider } from "./provider";
import { SadadProvider } from "./providers/sadad";

/**
 * Resolve the active payment provider for online checkout, or null when online
 * payment isn't ready (switched off or SADAD credentials aren't set). SADAD is
 * the store's only gateway — its credentials live in environment variables
 * only (never the database), so there is no "provider" to select here.
 */
export async function getProvider(config: SiteConfig): Promise<PaymentProvider | null> {
  if (!config.payments.onlineEnabled) return null;
  if (!SadadProvider.isConfigured()) return null;
  return new SadadProvider();
}
