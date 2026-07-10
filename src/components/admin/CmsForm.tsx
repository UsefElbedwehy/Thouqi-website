"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { saveCmsPageAction } from "@/core/admin/config-actions";
import type { LocalizedText } from "@/config/types";
import { LocalizedField } from "./LocalizedField";

export interface CmsFormInitial {
  id?: string;
  slug?: string;
  title?: LocalizedText;
  body?: LocalizedText;
  published?: boolean;
}

/** Create/edit a CMS page (localized title + body, publish toggle). */
export function CmsForm({ initial }: { initial?: CmsFormInitial }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [titleEn, setTitleEn] = useState(initial?.title?.en ?? "");
  const [titleAr, setTitleAr] = useState(initial?.title?.ar ?? "");
  const [bodyEn, setBodyEn] = useState(initial?.body?.en ?? "");
  const [bodyAr, setBodyAr] = useState(initial?.body?.ar ?? "");
  const [published, setPublished] = useState(initial?.published ?? false);

  const inputClass =
    "w-full rounded-[--radius] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const r = await saveCmsPageAction({ id: initial?.id, slug, titleEn, titleAr, bodyEn, bodyAr, published });
      if (r.ok) {
        router.push("/admin/cms");
        router.refresh();
      } else {
        setError(r.error ?? "Could not save");
      }
    });
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Slug (URL: /pages/&lt;slug&gt;)</span>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="about" className={inputClass} />
      </label>

      <LocalizedField label="Title" valueEn={titleEn} valueAr={titleAr} onChangeEn={setTitleEn} onChangeAr={setTitleAr} required />
      <LocalizedField label="Body (HTML allowed)" valueEn={bodyEn} valueAr={bodyAr} onChangeEn={setBodyEn} onChangeAr={setBodyAr} multiline />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="size-4" />
        Published (visible in store)
      </label>

      {error && <p className="text-sm text-accent">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[--radius] bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save page"}
        </button>
        <button type="button" onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </div>
    </form>
  );
}
