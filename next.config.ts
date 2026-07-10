import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Allow our own placeholder SVGs (trusted, first-party) through next/image.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Allow Supabase Storage + common CDNs. Extend via config, not code changes,
    // by adding hostnames to NEXT_PUBLIC_IMAGE_HOSTS (comma separated).
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      ...(process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "")
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean)
        .map((hostname) => ({ protocol: "https" as const, hostname })),
    ],
  },
  typedRoutes: true,
};

export default withNextIntl(nextConfig);
