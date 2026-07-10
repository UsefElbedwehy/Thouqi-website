import "server-only";
import { createSupabaseServerClient } from "@/data/supabase/server";
import type { Address } from "./types";

/** Addresses for the signed-in customer (RLS owner-scoped). */
export async function listAddresses(): Promise<Address[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data as Record<string, unknown>[]) ?? []).map((r) => ({
    id: r.id as string,
    label: (r.label as string) ?? null,
    line1: r.line1 as string,
    line2: (r.line2 as string) ?? null,
    city: (r.city as string) ?? null,
    area: (r.area as string) ?? null,
    countryCode: (r.country_code as string) ?? "KW",
    phone: (r.phone as string) ?? null,
    isDefault: (r.is_default as boolean) ?? false,
  }));
}
