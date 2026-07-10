"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Search } from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
import { t, formatPrice } from "@/lib/format";
import type { LocalizedText } from "@/config/types";

interface Suggestion {
  id: string;
  slug: string;
  name: LocalizedText;
  brand: LocalizedText;
  image: string | null;
  price: number;
}

/**
 * Header search with live typeahead. Debounced fetch to /api/search; shows a
 * dropdown of product suggestions. Submitting goes to the full search page.
 */
export function SearchBox() {
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        /* aborted */
      }
    }, 220);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [q]);

  // Close on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}` as never);
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-[280px]">
      <form onSubmit={submit} className="flex items-center gap-2 border-b border-border pb-1.5 focus-within:border-foreground">
        <Search className="size-4 text-muted-foreground" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder={tc("search")}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground placeholder:tracking-wide"
          aria-label={tc("search")}
        />
      </form>

      {open && results.length > 0 && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 border border-border bg-background shadow-[0_20px_40px_-20px_rgba(0,0,0,0.3)]">
          <ul className="max-h-[380px] overflow-auto py-1">
            {results.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/p/${r.slug}` as never}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-muted"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden bg-muted">
                    {r.image && <Image src={r.image} alt="" fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide">{t(r.brand, locale)}</p>
                    <p className="truncate text-sm text-muted-foreground">{t(r.name, locale)}</p>
                    <p className="text-xs font-medium">{formatPrice(r.price, locale)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
