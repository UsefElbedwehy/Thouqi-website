"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { saveCategoryAction, deleteCategoryAction } from "@/core/admin/actions";
import { LocalizedField } from "./LocalizedField";
import type { AdminCategoryRow } from "@/core/admin/service";

interface Row extends AdminCategoryRow {
  nameEn: string;
  nameAr: string;
}

const EMPTY = { id: "", nameEn: "", nameAr: "", slug: "", parentId: "", order: "0", visible: true };

/** Manage categories: list + add/edit form + delete. */
export function CategoryManager({ categories }: { categories: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ ...EMPTY });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-[--radius] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  function edit(c: Row) {
    setForm({
      id: c.id,
      nameEn: c.nameEn,
      nameAr: c.nameAr,
      slug: c.slug,
      parentId: c.parentId ?? "",
      order: String(c.order),
      visible: c.visible,
    });
    setOpen(true);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const r = await saveCategoryAction({
        id: form.id || undefined,
        slug: form.slug,
        nameEn: form.nameEn,
        nameAr: form.nameAr,
        parentId: form.parentId,
        order: form.order,
        visible: form.visible,
      });
      if (r.ok) {
        setForm({ ...EMPTY });
        setOpen(false);
        router.refresh();
      } else {
        setError(r.error ?? "Could not save");
      }
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this category?")) return;
    startTransition(async () => {
      await deleteCategoryAction(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.06em]">Categories</h1>
        <button
          type="button"
          onClick={() => { setForm({ ...EMPTY }); setOpen(true); }}
          className="flex items-center gap-2 rounded-[--radius] bg-foreground px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-background hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="size-4" /> New category
        </button>
      </div>

      {open && (
        <form onSubmit={save} className="grid gap-4 rounded-[--radius] border border-border p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <LocalizedField
              label="Name"
              valueEn={form.nameEn}
              valueAr={form.nameAr}
              onChangeEn={(v) => setForm((f) => ({ ...f, nameEn: v }))}
              onChangeAr={(v) => setForm((f) => ({ ...f, nameAr: v }))}
              required
            />
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Slug</span>
            <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Parent</span>
            <select value={form.parentId} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))} className={inputClass}>
              <option value="">— (top level)</option>
              {categories.filter((c) => c.id !== form.id).map((c) => (
                <option key={c.id} value={c.id}>{c.nameEn}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Sort order</span>
            <input value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} type="number" className={inputClass} />
          </label>
          <label className="flex items-center gap-2 self-end text-sm">
            <input type="checkbox" checked={form.visible} onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))} className="size-4" />
            Visible
          </label>
          {error && <p className="text-sm text-accent sm:col-span-2">{error}</p>}
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" disabled={pending} className="rounded-[--radius] bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-primary hover:text-primary-foreground disabled:opacity-60">
              Save
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-[--radius] border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 text-start font-medium">Name</th>
              <th className="p-3 text-start font-medium">Slug</th>
              <th className="p-3 text-start font-medium">Order</th>
              <th className="p-3 text-start font-medium">Visible</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-muted/30">
                <td className="p-3 font-medium">{c.nameEn}{c.parentId ? "" : ""}</td>
                <td className="p-3 text-muted-foreground">{c.slug}</td>
                <td className="p-3">{c.order}</td>
                <td className="p-3">{c.visible ? "Yes" : "No"}</td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-3">
                    <button type="button" onClick={() => edit(c)} className="text-primary hover:text-primary/70" aria-label="Edit">
                      <Pencil className="size-4" />
                    </button>
                    <button type="button" onClick={() => remove(c.id)} className="text-muted-foreground hover:text-accent" aria-label="Delete">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
