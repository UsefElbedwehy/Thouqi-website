"use client";

import Script from "next/script";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(args);
}

/** Fires a GA4 page_view on every client-side route change (App Router doesn't do this automatically). */
function PageViewTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = searchParams.size ? `${pathname}?${searchParams}` : pathname;
    gtag("event", "page_view", { page_path: url, send_to: measurementId });
  }, [pathname, searchParams, measurementId]);

  return null;
}

/**
 * GA4 via gtag.js. Off by default — only loads when
 * `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` is set (paste the client's GA4
 * measurement ID into env, no code change needed to enable).
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
  if (!measurementId) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });`}
      </Script>
      <Suspense fallback={null}>
        <PageViewTracker measurementId={measurementId} />
      </Suspense>
    </>
  );
}
