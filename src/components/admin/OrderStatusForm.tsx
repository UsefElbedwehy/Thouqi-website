"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { updateOrderAction } from "@/core/admin/actions";
import type { OrderStatus } from "@/core/orders/types";

const STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"];

/** Update an order's status + tracking number (admin). */
export function OrderStatusForm({
  id,
  status,
  trackingNumber,
}: {
  id: string;
  status: OrderStatus;
  trackingNumber: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [s, setS] = useState<OrderStatus>(status);
  const [tracking, setTracking] = useState(trackingNumber ?? "");
  const [saved, setSaved] = useState(false);

  const inputClass =
    "w-full rounded-[--radius] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      const r = await updateOrderAction({ id, status: s, trackingNumber: tracking });
      if (r.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-[--radius] border border-border p-5">
      <h3 className="text-sm font-bold uppercase tracking-wide">Update order</h3>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Status</span>
        <select value={s} onChange={(e) => setS(e.target.value as OrderStatus)} className={inputClass}>
          {STATUSES.map((v) => (
            <option key={v} value={v}>{v[0].toUpperCase() + v.slice(1)}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Tracking number</span>
        <input value={tracking} onChange={(e) => setTracking(e.target.value)} className={inputClass} dir="ltr" />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[--radius] bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-sm text-success">Saved</span>}
      </div>
    </form>
  );
}
