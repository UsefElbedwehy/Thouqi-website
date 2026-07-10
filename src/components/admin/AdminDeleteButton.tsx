"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

/** Confirm-then-delete button for admin tables. `action` returns {ok}. */
export function AdminDeleteButton({
  id,
  action,
  label = "Delete this item?",
}: {
  id: string;
  action: (id: string) => Promise<{ ok: boolean; error?: string }>;
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(label)) return;
        startTransition(async () => {
          await action(id);
          router.refresh();
        });
      }}
      className="text-muted-foreground transition-colors hover:text-accent disabled:opacity-50"
      aria-label="Delete"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
