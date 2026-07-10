"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { saveCollectionAction } from "@/core/admin/collections-actions";
import type { LocalizedText } from "@/config/types";
import { LocalizedField } from "./LocalizedField";
import { cn } from "@/lib/utils";

export interface CollectionFormInitial {
  id?: string;
  slug?: string;
  title?: LocalizedText;
  subtitle?: LocalizedText | null;
  bannerImage?: string;
  productIds?: string[];
}

interface ProductOption {
  id: string;
  label: string;
}

/** Create/edit a collection: localized title/subtitle, banner, product picker. */
export function CollectionForm({
  initial,
  products,
}: {
  initial?: CollectionFormInitial;
  products: ProductOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [titleEn, setTitleEn] = useState(initial?.title?.en ?? "");
  const [titleAr, setTitleAr] = useState(initial?.title?.ar ?? "");
  const [subEn, setSubEn] = useState(initial?.subtitle?.en ?? "");
  const [subAr, setSubAr] = useState(initial?.subtitle?.ar ?? "");
  const [banner, setBanner] = useState(initial?.bannerImage ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set(initial?.productIds ?? []));

  const inputClass =
    "w-full rounded-[--radius] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const r = await saveCollectionAction({
        id: initial?.id,
        slug,
        titleEn,
        titleAr,
        subtitleEn: subEn,
        subtitleAr: subAr,
        bannerImage: banner,
        productIds: [...selected],
      });
      if (r.ok) {
        router.push("/admin/collections");
        router.refresh();
      } else {
        setError(r.error ?? "Could not save");
      }
    });
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Slug</span>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="summer-edit" className={inputClass} />
      </label>
      <LocalizedField label="Title" valueEn={titleEn} valueAr={titleAr} onChangeEn={setTitleEn} onChangeAr={setTitleAr} required />
      <LocalizedField label="Subtitle" valueEn={subEn} valueAr={subAr} onChangeEn={setSubEn} onChangeAr={setSubAr} />
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Banner image URL</span>
        <input value={banner} onChange={(e) => setBanner(e.target.value)} type="url" className={inputClass} />
      </label>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Products ({selected.size} selected)</p>
        <div className="max-h-72 overflow-auto rounded-[--radius] border border-border">
          {products.map((p) => (
            <label
              key={p.id}
              className={cn(
                "flex cursor-pointer items-center gap-2 border-b border-border px-3 py-2 text-sm last:border-0 hover:bg-muted/50",
                selected.has(p.id) && "bg-primary/5",
              )}
            >
              <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="size-4" />
              {p.label}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[--radius] bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save collection"}
        </button>
        <button type="button" onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </div>
    </form>
  );
}
