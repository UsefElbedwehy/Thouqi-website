"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/data/supabase/server";

const profileSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6).optional().or(z.literal("")),
});

/** Change the signed-in user's password (min 8 chars). */
export async function changePasswordAction(raw: unknown): Promise<{ ok: boolean; error?: string }> {
  const parsed = z.object({ password: z.string().min(8) }).safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Password must be at least 8 characters." };
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Update the signed-in customer's profile (RLS: own row only). */
export async function updateProfileAction(raw: unknown): Promise<{ ok: boolean }> {
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { ok: false };
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase
    .from("customers")
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone || null })
    .eq("id", user.id);
  if (error) return { ok: false };
  revalidatePath("/account");
  return { ok: true };
}

const addressSchema = z.object({
  line1: z.string().min(3),
  line2: z.string().optional().or(z.literal("")),
  city: z.string().min(2),
  area: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  label: z.string().optional().or(z.literal("")),
});

/** Add an address for the signed-in customer. */
export async function addAddressAction(raw: unknown): Promise<{ ok: boolean }> {
  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) return { ok: false };
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase.from("addresses").insert({
    customer_id: user.id,
    label: parsed.data.label || null,
    line1: parsed.data.line1,
    line2: parsed.data.line2 || null,
    city: parsed.data.city,
    area: parsed.data.area || null,
    phone: parsed.data.phone || null,
    country_code: "KW",
  });
  if (error) return { ok: false };
  revalidatePath("/account/addresses");
  return { ok: true };
}

/** Delete one of the signed-in customer's addresses. */
export async function deleteAddressAction(id: string): Promise<{ ok: boolean }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  if (error) return { ok: false };
  revalidatePath("/account/addresses");
  return { ok: true };
}
