"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "./guard";
import { readAdminConfig, writeAdminConfig } from "./config-service";

const schema = z.object({
  onlineEnabled: z.boolean(),
  cod: z.boolean(),
  knet: z.boolean(),
  card: z.boolean(),
});

export interface PaymentActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Save payment settings — which methods show at checkout, and the online
 * master switch. SADAD's credentials aren't handled here: they live only in
 * SADAD_CLIENT_KEY / SADAD_SECRET_KEY environment variables (see the SADAD
 * status panel on the admin Payments page).
 */
export async function savePaymentsAction(raw: unknown): Promise<PaymentActionResult> {
  await assertAdmin();
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };
  const d = parsed.data;

  const config = await readAdminConfig();
  config.payments = {
    onlineEnabled: d.onlineEnabled,
    methods: { cod: d.cod, knet: d.knet, card: d.card },
  };
  try {
    await writeAdminConfig(config);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/payments");
  return { ok: true };
}
