import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (anon key, RLS-protected). Use only in Client
 * Components that genuinely need realtime/auth on the client. Prefer the
 * server client + repositories for data fetching.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
