"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { signInAction, signUpAction } from "@/core/auth/actions";
import { cn } from "@/lib/utils";

/** Sign-in / sign-up form. `mode` selects behaviour; both call server actions. */
export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
      fullName: String(fd.get("fullName") ?? ""),
      locale,
    };
    startTransition(async () => {
      const result =
        mode === "signup" ? await signUpAction(payload) : await signInAction(payload);
      if (result.ok) {
        router.push("/account");
        router.refresh();
      } else {
        setError(mode === "signup" ? t("signUpError") : t("error"));
      }
    });
  }

  const inputClass =
    "w-full rounded-[--radius] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "signup" && (
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">{t("fullName")}</span>
          <input name="fullName" type="text" required minLength={2} className={inputClass} />
        </label>
      )}
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">{t("email")}</span>
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">{t("password")}</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className={inputClass}
        />
      </label>

      {error && <p className="text-sm text-accent">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "w-full rounded-[--radius] bg-foreground py-3 text-xs font-semibold uppercase tracking-[0.14em] text-background transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-60",
        )}
      >
        {pending ? t("processing") : mode === "signup" ? t("signUpCta") : t("signInCta")}
      </button>

      <p className="pt-2 text-center text-sm text-muted-foreground">
        {mode === "signup" ? t("haveAccount") : t("noAccount")}{" "}
        <Link href={mode === "signup" ? "/login" : "/register"} className="text-primary hover:underline">
          {mode === "signup" ? t("signInInstead") : t("createOne")}
        </Link>
      </p>
    </form>
  );
}
