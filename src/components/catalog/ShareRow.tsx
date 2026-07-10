"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link2, Check } from "lucide-react";

/**
 * Social share row for the PDP. The current URL is resolved after mount (not
 * during render) to avoid a server/client hydration mismatch.
 */
export function ShareRow({ title, image }: { title: string; image?: string }) {
  const tp = useTranslations("product");
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href), []);

  const enc = encodeURIComponent(url);
  const shares = [
    { label: "X", href: `https://twitter.com/intent/tweet?url=${enc}&text=${encodeURIComponent(title)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}` },
    { label: "Pinterest", href: `https://pinterest.com/pin/create/button/?url=${enc}&media=${encodeURIComponent(image ?? "")}` },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{tp("shareWithFriends")}</span>
      <div className="flex items-center gap-2">
        {shares.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer noopener"
            className="flex size-8 items-center justify-center rounded-full border border-border text-[10px] font-semibold uppercase text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label={`Share on ${s.label}`}
          >
            {s.label[0]}
          </a>
        ))}
        <button
          type="button"
          onClick={copy}
          className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          aria-label="Copy link"
        >
          {copied ? <Check className="size-4 text-success" /> : <Link2 className="size-4" />}
        </button>
      </div>
    </div>
  );
}
