"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateProfileAction } from "@/core/account/actions";
import type { CustomerProfile } from "@/core/account/types";

/** Edit the signed-in customer's name + phone. */
export function ProfileForm({ profile }: { profile: CustomerProfile }) {
  const t = useTranslations("account");
  const ta = useTranslations("auth");
  const tco = useTranslations("checkout");
  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const inputClass =
    "w-full rounded-[--radius] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      const r = await updateProfileAction({ fullName, phone });
      if (r.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">{ta("fullName")}</span>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">{ta("email")}</span>
        <input value={profile.email ?? ""} disabled className={`${inputClass} opacity-60`} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">{tco("phone")}</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} dir="ltr" />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[--radius] bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
        >
          {t("save")}
        </button>
        {saved && <span className="text-sm text-success">{t("saved")}</span>}
      </div>
    </form>
  );
}
