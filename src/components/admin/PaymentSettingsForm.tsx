"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { savePaymentsAction } from "@/core/admin/payment-actions";
import { cn } from "@/lib/utils";

export interface PaymentSettingsInitial {
  onlineEnabled: boolean;
  cod: boolean;
  knet: boolean;
  card: boolean;
  provider: "knet" | "myfatoorah" | "mock";
  testMode: boolean;
  hasKey: boolean;
}

/**
 * Admin payment configuration. Toggles online payment + methods (public config)
 * and stores the gateway secret key (server-only). Deploy with online OFF, then
 * paste the client's key and switch it on — no redeploy.
 */
export function PaymentSettingsForm({ initial }: { initial: PaymentSettingsInitial }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ ...initial, apiKey: "" });

  const inputClass =
    "w-full rounded-[--radius] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const r = await savePaymentsAction({
        onlineEnabled: form.onlineEnabled,
        cod: form.cod,
        knet: form.knet,
        card: form.card,
        provider: form.provider,
        testMode: form.testMode,
        apiKey: form.apiKey,
      });
      if (r.ok) {
        setSaved(true);
        setForm((f) => ({ ...f, apiKey: "", hasKey: f.hasKey || !!f.apiKey }));
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(r.error ?? "Could not save");
      }
    });
  }

  const online = form.onlineEnabled;

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-8">
      {/* Master switch */}
      <label className="flex items-center justify-between gap-3 rounded-[--radius] border border-border p-4">
        <span>
          <span className="block text-sm font-medium">Online payment</span>
          <span className="block text-xs text-muted-foreground">
            Off = Cash on Delivery only (safe to deploy without a gateway key).
          </span>
        </span>
        <input
          type="checkbox"
          checked={form.onlineEnabled}
          onChange={(e) => setForm((f) => ({ ...f, onlineEnabled: e.target.checked }))}
          className="size-5"
        />
      </label>

      {/* Methods */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">Methods offered at checkout</h2>
        <div className="space-y-2">
          {[
            { key: "cod" as const, label: "Cash on Delivery", needsOnline: false },
            { key: "knet" as const, label: "KNET", needsOnline: true },
            { key: "card" as const, label: "Credit / Debit Card", needsOnline: true },
          ].map(({ key, label, needsOnline }) => {
            const blocked = needsOnline && (!online || !form.hasKey);
            return (
              <label
                key={key}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-[--radius] border border-border px-4 py-3 text-sm",
                  blocked && "opacity-60",
                )}
              >
                <span>
                  {label}
                  {needsOnline && (
                    <span className="ms-2 text-xs text-muted-foreground">
                      {!online ? "(enable online payment)" : !form.hasKey ? "(add a gateway key)" : ""}
                    </span>
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  className="size-4"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Gateway */}
      <div className={cn("space-y-4", !online && "opacity-60")}>
        <h2 className="text-sm font-bold uppercase tracking-wide">Gateway</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Provider</span>
            <select
              value={form.provider}
              onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value as "knet" | "myfatoorah" | "mock" }))}
              className={inputClass}
            >
              <option value="knet">KNET (via MyFatoorah)</option>
              <option value="myfatoorah">MyFatoorah</option>
              <option value="mock">Sandbox (testing)</option>
            </select>
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={form.testMode}
              onChange={(e) => setForm((f) => ({ ...f, testMode: e.target.checked }))}
              className="size-4"
            />
            Test / sandbox mode
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            API / merchant key {form.hasKey && <span className="text-success">— key on file (leave blank to keep)</span>}
          </span>
          <input
            type="password"
            value={form.apiKey}
            onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
            placeholder={form.hasKey ? "••••••••  (stored)" : "Paste the client's key here"}
            className={inputClass}
            autoComplete="off"
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            Stored server-side only (never sent to the browser or the public config).
          </span>
        </label>
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[--radius] bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save payment settings"}
        </button>
        {saved && <span className="text-sm text-success">Saved.</span>}
      </div>
    </form>
  );
}
