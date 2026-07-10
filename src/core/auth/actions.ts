"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/data/supabase/server";

export interface AuthResult {
  ok: boolean;
  error?: string;
}

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  // Empty string is allowed (sign-in sends no name); sign-up enforces length client-side.
  fullName: z.string().optional().or(z.literal("")),
  locale: z.string().default("ar"),
});

/** Sign in with email + password. Session cookies are set by the server client. */
export async function signInAction(raw: unknown): Promise<AuthResult> {
  const parsed = credsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Register a new account. `handle_new_user` trigger creates the customer row. */
export async function signUpAction(raw: unknown): Promise<AuthResult> {
  const parsed = credsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName ?? "",
        locale: parsed.data.locale,
      },
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Sign out and clear the session. */
export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
