import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./data/supabase/middleware";

const handleIntl = createIntlMiddleware(routing);

/**
 * Runs locale routing (next-intl) then refreshes the Supabase session, merging
 * rotated auth cookies onto the intl response.
 */
export async function middleware(request: NextRequest) {
  const response = handleIntl(request);
  // Expose the pathname to Server Components (e.g. so the root layout can skip
  // the storefront chrome on /admin routes).
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return updateSession(request, response);
}

export const config = {
  // Match all pathnames except API routes, Next internals, and static files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
