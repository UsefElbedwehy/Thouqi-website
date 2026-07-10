"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { changePasswordAction } from "@/core/account/actions";

/** Lets the signed-in user set a new password (secures the default admin login). */
export function ChangePasswordForm() {
  const t = useTranslations("account");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const inputClass =
    "w-full rounded-[--radius] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pw !== confirm) {
      setMsg({ ok: false, text: t("passwordMismatch") });
      return;
    }
    startTransition(async () => {
      const r = await changePasswordAction({ password: pw });
      if (r.ok) {
        setMsg({ ok: true, text: t("passwordUpdated") });
        setPw("");
        setConfirm("");
      } else {
        setMsg({ ok: false, text: r.error ?? "Error" });
      }
    });
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">{t("newPassword")}</span>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={8} autoComplete="new-password" className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">{t("confirmPassword")}</span>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} autoComplete="new-password" className={inputClass} />
      </label>
      {msg && <p className={msg.ok ? "text-sm text-success" : "text-sm text-accent"}>{msg.text}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[--radius] bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
      >
        {pending ? "…" : t("updatePassword")}
      </button>
    </form>
  );
}
