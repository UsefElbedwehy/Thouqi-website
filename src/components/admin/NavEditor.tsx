"use client";

import { useState, useTransition } from "react";
import { ArrowUp, ArrowDown, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { saveNavigationAction } from "@/core/admin/config-actions";
import { LocalizedField } from "./LocalizedField";
import { cn } from "@/lib/utils";

interface EditableLink {
  labelEn: string;
  labelAr: string;
  href: string;
}

interface EditableColumn {
  headingEn: string;
  headingAr: string;
  links: EditableLink[];
}

interface EditableNavItem {
  id: string;
  labelEn: string;
  labelAr: string;
  href: string;
  highlight: boolean;
  columns: EditableColumn[];
}

const inputClass =
  "w-full rounded-[--radius] border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function newId() {
  return `nav-${Math.random().toString(36).slice(2, 10)}`;
}

/** Reorderable header nav / mega-menu editor; persists to the remote config. */
export function NavEditor({ items: initial }: { items: EditableNavItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState<EditableNavItem[]>(initial);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleOpen(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function update(index: number, patch: Partial<EditableNavItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function move(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addItem() {
    const item: EditableNavItem = { id: newId(), labelEn: "", labelAr: "", href: "/", highlight: false, columns: [] };
    setItems((prev) => [...prev, item]);
    setOpen((prev) => new Set(prev).add(item.id));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addColumn(itemIndex: number) {
    update(itemIndex, {
      columns: [...items[itemIndex].columns, { headingEn: "", headingAr: "", links: [] }],
    });
  }

  function updateColumn(itemIndex: number, colIndex: number, patch: Partial<EditableColumn>) {
    const columns = items[itemIndex].columns.map((c, i) => (i === colIndex ? { ...c, ...patch } : c));
    update(itemIndex, { columns });
  }

  function removeColumn(itemIndex: number, colIndex: number) {
    update(itemIndex, { columns: items[itemIndex].columns.filter((_, i) => i !== colIndex) });
  }

  function addLink(itemIndex: number, colIndex: number) {
    const columns = items[itemIndex].columns.map((c, i) =>
      i === colIndex ? { ...c, links: [...c.links, { labelEn: "", labelAr: "", href: "/" }] } : c,
    );
    update(itemIndex, { columns });
  }

  function updateLink(itemIndex: number, colIndex: number, linkIndex: number, patch: Partial<EditableLink>) {
    const columns = items[itemIndex].columns.map((c, i) =>
      i === colIndex ? { ...c, links: c.links.map((l, j) => (j === linkIndex ? { ...l, ...patch } : l)) } : c,
    );
    update(itemIndex, { columns });
  }

  function removeLink(itemIndex: number, colIndex: number, linkIndex: number) {
    const columns = items[itemIndex].columns.map((c, i) =>
      i === colIndex ? { ...c, links: c.links.filter((_, j) => j !== linkIndex) } : c,
    );
    update(itemIndex, { columns });
  }

  function save() {
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const r = await saveNavigationAction(items);
      if (r.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(r.error ?? "Could not save");
      }
    });
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.06em]">Navigation</h1>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-[--radius] bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save navigation"}
        </button>
      </div>
      <p className="mb-8 text-sm text-muted-foreground">
        Header links and mega-menu columns. Applied to the storefront header immediately.
        {saved && <span className="ms-2 text-success">Saved.</span>}
        {error && <span className="ms-2 text-accent">{error}</span>}
      </p>

      <ul className="max-w-3xl space-y-3">
        {items.map((item, i) => {
          const isOpen = open.has(item.id);
          return (
            <li key={item.id} className="rounded-[--radius] border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleOpen(item.id)}
                  className="mt-2 text-muted-foreground hover:text-foreground"
                  aria-label={isOpen ? "Collapse" : "Expand"}
                >
                  {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </button>

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <LocalizedField
                      label="Label"
                      valueEn={item.labelEn}
                      valueAr={item.labelAr}
                      onChangeEn={(v) => update(i, { labelEn: v })}
                      onChangeAr={(v) => update(i, { labelAr: v })}
                      required
                    />
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-muted-foreground">Link (href)</span>
                      <input value={item.href} onChange={(e) => update(i, { href: e.target.value })} className={inputClass} />
                    </label>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.highlight}
                        onChange={(e) => update(i, { highlight: e.target.checked })}
                        className="size-4"
                      />
                      Highlight (accent color)
                    </label>
                    <span>
                      {item.columns.length} mega-menu column{item.columns.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {isOpen && (
                    <div className="space-y-3 border-t border-border pt-3">
                      {item.columns.map((col, ci) => (
                        <div key={ci} className="rounded-[--radius] border border-border/70 bg-muted/20 p-3">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="grid flex-1 gap-2 sm:grid-cols-2">
                              <input
                                value={col.headingEn}
                                onChange={(e) => updateColumn(i, ci, { headingEn: e.target.value })}
                                placeholder="Column heading (EN)"
                                className={inputClass}
                              />
                              <input
                                value={col.headingAr}
                                onChange={(e) => updateColumn(i, ci, { headingAr: e.target.value })}
                                placeholder="عنوان العمود"
                                dir="rtl"
                                className={inputClass}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeColumn(i, ci)}
                              className="text-muted-foreground hover:text-accent"
                              aria-label="Remove column"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>

                          <div className="space-y-2">
                            {col.links.map((link, li) => (
                              <div key={li} className="grid items-center gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                                <input
                                  value={link.labelEn}
                                  onChange={(e) => updateLink(i, ci, li, { labelEn: e.target.value })}
                                  placeholder="Label (EN)"
                                  className={inputClass}
                                />
                                <input
                                  value={link.labelAr}
                                  onChange={(e) => updateLink(i, ci, li, { labelAr: e.target.value })}
                                  placeholder="التسمية"
                                  dir="rtl"
                                  className={inputClass}
                                />
                                <input
                                  value={link.href}
                                  onChange={(e) => updateLink(i, ci, li, { href: e.target.value })}
                                  placeholder="/path"
                                  className={inputClass}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeLink(i, ci, li)}
                                  className="text-muted-foreground hover:text-accent"
                                  aria-label="Remove link"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addLink(i, ci)}
                              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                            >
                              <Plus className="size-3.5" /> Add link
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addColumn(i)}
                        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground hover:text-primary"
                      >
                        <Plus className="size-3.5" /> Add mega-menu column
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Move up">
                    <ArrowUp className="size-4" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Move down">
                    <ArrowDown className="size-4" />
                  </button>
                  <button type="button" onClick={() => removeItem(i)} className="mt-2 text-muted-foreground hover:text-accent" aria-label="Remove item">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={addItem}
        className={cn(
          "mt-4 flex items-center gap-2 rounded-[--radius] border border-dashed border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground hover:border-primary hover:text-primary",
        )}
      >
        <Plus className="size-4" /> Add nav item
      </button>
    </div>
  );
}
