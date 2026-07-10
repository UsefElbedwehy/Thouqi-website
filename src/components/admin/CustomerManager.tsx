"use client";

import { useTransition } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { setCustomerRoleAction } from "@/core/admin/config-actions";
import type { AdminCustomerRow } from "@/core/admin/service";

/** Customers table with a per-row admin role toggle. */
export function CustomerManager({ customers }: { customers: AdminCustomerRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle(c: AdminCustomerRow) {
    const role = c.role === "admin" ? "customer" : "admin";
    startTransition(async () => {
      await setCustomerRoleAction({ id: c.id, role });
      router.refresh();
    });
  }

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-semibold uppercase tracking-[0.06em]">Customers</h1>
      <div className="overflow-hidden rounded-[--radius] border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 text-start font-medium">Name</th>
              <th className="p-3 text-start font-medium">Email</th>
              <th className="p-3 text-start font-medium">Orders</th>
              <th className="p-3 text-start font-medium">Role</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-muted/30">
                <td className="p-3 font-medium">{c.fullName ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{c.email}</td>
                <td className="p-3">{c.orderCount}</td>
                <td className="p-3">
                  <span
                    className={`inline-flex px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                      c.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.role}
                  </span>
                </td>
                <td className="p-3 text-end">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggle(c)}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    {c.role === "admin" ? <ShieldOff className="size-4" /> : <ShieldCheck className="size-4" />}
                    {c.role === "admin" ? "Revoke admin" : "Make admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
