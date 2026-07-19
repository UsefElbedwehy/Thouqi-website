"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { deleteOrderAction } from "@/core/admin/actions";
import { cn } from "@/lib/utils";

/** Permanently deletes an order after a confirm click. Used to clear test orders. */
export function DeleteOrderButton({ id, reference, compact = false }: { id: string; reference: string; compact?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      await deleteOrderAction(id);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onBlur={() => setConfirming(false)}
      disabled={pending}
      title={confirming ? `Click again to permanently delete ${reference}` : `Delete ${reference}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[--radius] border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-60",
        confirming
          ? "border-accent bg-accent text-white"
          : "border-border text-muted-foreground hover:border-accent hover:text-accent",
        compact && "px-2 py-1",
      )}
    >
      <Trash2 className="size-3.5" />
      {pending ? "Deleting…" : confirming ? "Confirm delete" : "Delete"}
    </button>
  );
}
