"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { saveProductAction } from "@/core/admin/actions";
import type { LocalizedText } from "@/config/types";
import { LocalizedField } from "./LocalizedField";
import { cn } from "@/lib/utils";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

export interface ProductFormInitial {
  id?: string;
  slug?: string;
  name?: LocalizedText;
  description?: LocalizedText;
  brandId?: string;
  price?: number; // minor units
  compareAtPrice?: number | null;
  available?: boolean;
  imageUrl?: string;
  categoryId?: string;
  sizes?: string[];
  sizeInventory?: number;
}

interface Option {
  id: string;
  label: string;
}

/** Create/edit a product. Prices shown in KD; converted server-side to minor units. */
export function ProductForm({
  initial,
  brands,
  categories,
}: {
  initial?: ProductFormInitial;
  brands: Option[];
  categories: Option[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [nameEn, setNameEn] = useState(initial?.name?.en ?? "");
  const [nameAr, setNameAr] = useState(initial?.name?.ar ?? "");
  const [descEn, setDescEn] = useState(initial?.description?.en ?? "");
  const [descAr, setDescAr] = useState(initial?.description?.ar ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [brandId, setBrandId] = useState(initial?.brandId ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [price, setPrice] = useState(initial?.price != null ? (initial.price / 1000).toString() : "");
  const [compareAt, setCompareAt] = useState(
    initial?.compareAtPrice != null ? (initial.compareAtPrice / 1000).toString() : "",
  );
  const [available, setAvailable] = useState(initial?.available ?? true);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [sizes, setSizes] = useState<string[]>(initial?.sizes ?? []);
  const [sizeInventory, setSizeInventory] = useState(String(initial?.sizeInventory ?? 20));

  function toggleSize(s: string) {
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  const inputClass =
    "w-full rounded-[--radius] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  function slugify(v: string) {
    return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const r = await saveProductAction({
        id: initial?.id,
        slug: slug || slugify(nameEn),
        nameEn,
        nameAr,
        descEn,
        descAr,
        brandId,
        price,
        compareAtPrice: compareAt,
        available,
        imageUrl,
        categoryId,
        sizes,
        sizeInventory,
      });
      if (r.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(r.error ?? "Could not save");
      }
    });
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <LocalizedField label="Name" valueEn={nameEn} valueAr={nameAr} onChangeEn={setNameEn} onChangeAr={setNameAr} required />
      <LocalizedField label="Description" valueEn={descEn} valueAr={descAr} onChangeEn={setDescEn} onChangeAr={setDescAr} multiline />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Slug</span>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugify(nameEn) || "auto"} className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Brand</span>
          <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className={inputClass}>
            <option value="">—</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Category</span>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Image URL</span>
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} type="url" className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Price (KD)</span>
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.001" required className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Compare-at price (KD)</span>
          <input value={compareAt} onChange={(e) => setCompareAt(e.target.value)} type="number" step="0.001" className={inputClass} />
        </label>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground">Sizes</p>
        <p className="mb-2 text-xs text-muted-foreground">
          Select the sizes this item comes in. Customers must choose a size before adding to cart.
          Leave empty for one-size items (jewelry, beauty, bags…).
        </p>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSize(s)}
              className={cn(
                "min-w-12 rounded-[--radius] border px-3 py-2 text-sm",
                sizes.includes(s) ? "border-primary bg-primary/5 text-primary" : "border-border",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        {sizes.length > 0 && (
          <label className="mt-3 block max-w-[200px]">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Inventory per size</span>
            <input value={sizeInventory} onChange={(e) => setSizeInventory(e.target.value)} type="number" min="0" className={inputClass} />
          </label>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="size-4" />
        Available (visible in store)
      </label>

      {error && <p className="text-sm text-accent">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[--radius] bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save product"}
        </button>
        <button type="button" onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </div>
    </form>
  );
}
