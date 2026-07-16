"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { savePaymentsAction } from "@/core/admin/payment-actions";
import { cn } from "@/lib/utils";

export interface PaymentSettingsInitial {
  onlineEnabled: boolean;
  cod: boolean;
  knet: boolean;
  card: boolean;
}

export interface SadadStatus {
  hasClientKey: boolean;
  hasSecretKey: boolean;
  isSandbox: boolean;
  baseUrl: string;
}

/**
 * Admin payment configuration. SADAD is the store's only gateway and its
 * credentials are environment-variable-only (SADAD_CLIENT_KEY /
 * SADAD_SECRET_KEY) — this form only ever toggles the public config (online
 * switch + which methods show); it never collects or displays secrets.
 */
export function PaymentSettingsForm({
  initial,
  sadad,
}: {
  initial: PaymentSettingsInitial;
  sadad: SadadStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const r = await savePaymentsAction(form);
      if (r.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(r.error ?? "Could not save");
      }
    });
  }

  const online = form.onlineEnabled;
  const sadadReady = sadad.hasClientKey && sadad.hasSecretKey;

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-8">
      {/* Master switch */}
      <label className="flex items-center justify-between gap-3 rounded-[--radius] border border-border p-4">
        <span>
          <span className="block text-sm font-medium">Online payment</span>
          <span className="block text-xs text-muted-foreground">
            Off = Cash on Delivery only (safe to deploy without SADAD configured).
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
            const blocked = needsOnline && (!online || !sadadReady);
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
                      {!online ? "(enable online payment)" : !sadadReady ? "(SADAD not configured)" : ""}
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

      {/* SADAD status — read-only, no secrets ever shown or entered here */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">Gateway — SADAD Pay</h2>
        <div className="space-y-2 rounded-[--radius] border border-border p-4 text-sm">
          <StatusRow label="Client key" ok={sadad.hasClientKey} />
          <StatusRow label="Secret key" ok={sadad.hasSecretKey} />
          <div className="flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
            <span>Mode</span>
            <span>{sadad.isSandbox ? "Sandbox" : "Live"}</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Set via environment variables, not here: <code>SADAD_CLIENT_KEY</code>,{" "}
          <code>SADAD_SECRET_KEY</code>, and optionally <code>SADAD_BASE_URL</code> (omit for
          live, set to <code>https://apisandbox.sadadpay.net</code> for sandbox). Changing them
          requires a redeploy. In the SADAD merchant dashboard, set the WebhookURL to{" "}
          <code>/api/payments/sadad-webhook</code> (must stay public — no auth) and the
          Success/Fail Return URLs to <code>/api/payments/sadad-return</code>.
        </p>
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

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      {ok ? (
        <span className="flex items-center gap-1.5 text-success">
          <CheckCircle2 className="size-4" /> Configured
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <XCircle className="size-4" /> Missing
        </span>
      )}
    </div>
  );
}
