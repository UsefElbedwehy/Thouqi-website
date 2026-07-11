"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/data/supabase/server";
import { assertAdmin } from "./guard";
import { readAdminConfig, writeAdminConfig } from "./config-service";

const schema = z.object({
  onlineEnabled: z.boolean(),
  cod: z.boolean(),
  knet: z.boolean(),
  card: z.boolean(),
  provider: z.enum(["knet", "myfatoorah", "sadad", "mock"]),
  testMode: z.boolean().default(true),
  // Blank = keep the existing stored key (so admins don't have to re-enter it).
  apiKey: z.string().optional().or(z.literal("")),
  // SADAD only: second credential (client key uses apiKey above).
  apiSecret: z.string().optional().or(z.literal("")),
});

export interface PaymentActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Save payment settings.
 *  - Public part (which methods show, provider) → `app_config.config.payments`.
 *  - Secret key → server-only `payment_settings` (only written when a new key is
 *    provided; a blank field preserves the existing key).
 */
export async function savePaymentsAction(raw: unknown): Promise<PaymentActionResult> {
  await assertAdmin();
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };
  const d = parsed.data;

  // 1) Public config.
  const config = await readAdminConfig();
  config.payments = {
    onlineEnabled: d.onlineEnabled,
    methods: { cod: d.cod, knet: d.knet, card: d.card },
    provider: d.provider,
  };
  try {
    await writeAdminConfig(config);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  // 2) Secret store (upsert singleton; only set a key when a new one is given).
  const db = createSupabaseAdminClient();
  const row: Record<string, unknown> = { id: true, provider: d.provider, test_mode: d.testMode };
  if (d.apiKey) row.api_key = d.apiKey;
  if (d.apiSecret) row.api_secret = d.apiSecret;
  const { error } = await db.from("payment_settings").upsert(row, { onConflict: "id" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/admin/payments");
  return { ok: true };
}
