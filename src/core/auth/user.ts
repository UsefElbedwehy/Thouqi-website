import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/data/supabase/server";
import type { CustomerProfile } from "@/core/account/types";

/**
 * Current authenticated user + customer profile for the request, or null.
 * Cached per request. Reads the profile under RLS (owner-scoped).
 */
export const getCurrentUser = cache(async (): Promise<{
  id: string;
  email: string | null;
  profile: CustomerProfile | null;
} | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: row } = await supabase
    .from("customers")
    .select("id, email, full_name, phone, role, locale")
    .eq("id", user.id)
    .maybeSingle();

  const profile: CustomerProfile | null = row
    ? {
        id: row.id as string,
        email: (row.email as string) ?? user.email ?? null,
        fullName: (row.full_name as string) ?? null,
        phone: (row.phone as string) ?? null,
        role: (row.role as CustomerProfile["role"]) ?? "customer",
        locale: (row.locale as string) ?? "ar",
      }
    : null;

  return { id: user.id, email: user.email ?? null, profile };
});
