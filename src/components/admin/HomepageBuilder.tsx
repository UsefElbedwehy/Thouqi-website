"use client";

import { useState, useTransition } from "react";
import { ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { saveHomeSectionsAction } from "@/core/admin/config-actions";
import type { HomeSection } from "@/config/types";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  hero: "Hero banner",
  productRail: "Product rail",
  categoryGrid: "Category grid",
  promoBanner: "Promo banner",
  collectionShowcase: "Collection showcase",
};

function sectionName(s: HomeSection): string {
  const settings = s.settings as Record<string, unknown>;
  const title = settings.title as { en?: string } | undefined;
  if (title?.en) return title.en;
  if (settings.titleKey) return String(settings.titleKey).split(".").pop() ?? "";
  if (settings.categorySlug) return String(settings.categorySlug);
  return "";
}

/** Reorder + enable/disable homepage sections; persists to the remote config. */
export function HomepageBuilder({ sections: initial }: { sections: HomeSection[] }) {
  const router = useRouter();
  const [sections, setSections] = useState<HomeSection[]>(
    [...initial].sort((a, b) => a.order - b.order),
  );
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function move(index: number, dir: -1 | 1) {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next.map((s, i) => ({ ...s, order: i + 1 })));
  }

  function toggle(index: number) {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s)));
  }

  function save() {
    setSaved(false);
    startTransition(async () => {
      const r = await saveHomeSectionsAction(sections.map((s, i) => ({ ...s, order: i + 1 })));
      if (r.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.06em]">Homepage</h1>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-[--radius] bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save layout"}
        </button>
      </div>
      <p className="mb-8 text-sm text-muted-foreground">
        Drag order with the arrows, toggle visibility, then save. Applied to the storefront homepage.
        {saved && <span className="ms-2 text-success">Saved.</span>}
      </p>

      <ul className="max-w-2xl space-y-2">
        {sections.map((s, i) => (
          <li
            key={s.id}
            className={cn(
              "flex items-center gap-3 rounded-[--radius] border border-border bg-background p-3",
              !s.enabled && "opacity-60",
            )}
          >
            <GripVertical className="size-4 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {TYPE_LABEL[s.type] ?? s.type}
                {sectionName(s) && <span className="text-muted-foreground"> · {sectionName(s)}</span>}
              </p>
              <p className="text-xs text-muted-foreground">#{i + 1}</p>
            </div>

            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={s.enabled} onChange={() => toggle(i)} className="size-4" />
              Visible
            </label>

            <div className="flex flex-col">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Move up">
                <ArrowUp className="size-4" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Move down">
                <ArrowDown className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
