"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { signOutAction } from "@/core/auth/actions";

export function SignOutButton() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOutAction();
          router.push("/");
          router.refresh();
        })
      }
      className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent disabled:opacity-50"
    >
      <LogOut className="size-4 rtl:rotate-180" />
      {t("signOut")}
    </button>
  );
}
