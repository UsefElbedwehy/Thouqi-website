"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { saveSettingsAction } from "@/core/admin/config-actions";

export interface SettingsInitial {
  nameEn: string;
  nameAr: string;
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  features: Record<string, boolean>;
}

const COLORS: { key: keyof Pick<SettingsInitial, "primary" | "accent" | "background" | "foreground">; label: string }[] = [
  { key: "primary", label: "Primary" },
  { key: "accent", label: "Accent (sale)" },
  { key: "background", label: "Background" },
  { key: "foreground", label: "Foreground (text)" },
];

/** Edit brand name, palette and feature flags → persisted to app_config. */
export function SettingsForm({ initial }: { initial: SettingsInitial }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initial);

  const inputClass =
    "w-full rounded-[--radius] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const r = await saveSettingsAction(form);
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
    <form onSubmit={submit} className="max-w-2xl space-y-8">
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">Brand name</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">English</span>
            <input value={form.nameEn} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">العربية</span>
            <input value={form.nameAr} onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))} dir="rtl" className={inputClass} />
          </label>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">Palette</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {COLORS.map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between gap-3 rounded-[--radius] border border-border p-3">
              <span className="text-sm">{label}</span>
              <span className="flex items-center gap-2">
                <input value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="w-24 rounded-[--radius] border border-border px-2 py-1 text-xs" />
                <input type="color" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="size-8 cursor-pointer rounded border border-border" />
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">Feature flags</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(form.features).map(([key, val]) => (
            <label key={key} className="flex items-center gap-2 rounded-[--radius] border border-border px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={val}
                onChange={(e) => setForm((f) => ({ ...f, features: { ...f.features, [key]: e.target.checked } }))}
                className="size-4"
              />
              {key}
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
          {pending ? "Saving…" : "Save settings"}
        </button>
        {saved && <span className="text-sm text-success">Saved — refresh the store to see changes.</span>}
      </div>
    </form>
  );
}
