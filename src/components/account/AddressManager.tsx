"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash2, Plus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { addAddressAction, deleteAddressAction } from "@/core/account/actions";
import type { Address } from "@/core/account/types";

const EMPTY = { label: "", line1: "", line2: "", city: "", area: "", phone: "" };

/** List + add + delete saved addresses. */
export function AddressManager({ addresses }: { addresses: Address[] }) {
  const t = useTranslations("account");
  const tco = useTranslations("checkout");
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(addresses.length === 0);
  const [pending, startTransition] = useTransition();

  const inputClass =
    "w-full rounded-[--radius] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function add(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const r = await addAddressAction(form);
      if (r.ok) {
        setForm(EMPTY);
        setOpen(false);
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteAddressAction(id);
      router.refresh();
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide">{t("addresses")}</h2>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Plus className="size-4" /> {t("addAddress")}
          </button>
        )}
      </div>

      {addresses.length === 0 && !open ? (
        <p className="text-sm text-muted-foreground">{t("noAddresses")}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="relative border border-border p-4 text-sm">
              {a.isDefault && (
                <span className="absolute end-3 top-3 bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("default")}
                </span>
              )}
              <p className="font-medium">{a.line1}</p>
              {a.line2 && <p className="text-muted-foreground">{a.line2}</p>}
              <p className="text-muted-foreground">{[a.city, a.area].filter(Boolean).join(", ")}</p>
              {a.phone && <p className="text-muted-foreground" dir="ltr">{a.phone}</p>}
              <button
                type="button"
                onClick={() => remove(a.id)}
                disabled={pending}
                className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-accent"
              >
                <Trash2 className="size-3.5" /> {t("delete")}
              </button>
            </div>
          ))}
        </div>
      )}

      {open && (
        <form onSubmit={add} className="grid max-w-lg gap-3 border border-border p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <input placeholder={tco("line1")} value={form.line1} onChange={set("line1")} required className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <input placeholder={tco("line2")} value={form.line2} onChange={set("line2")} className={inputClass} />
          </div>
          <input placeholder={tco("city")} value={form.city} onChange={set("city")} required className={inputClass} />
          <input placeholder={tco("area")} value={form.area} onChange={set("area")} className={inputClass} />
          <input placeholder={tco("phone")} value={form.phone} onChange={set("phone")} className={inputClass} dir="ltr" />
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-[--radius] bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
            >
              {t("save")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
