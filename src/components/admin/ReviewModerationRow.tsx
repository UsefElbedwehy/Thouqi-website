"use client";

import { useTransition } from "react";
import { Check, X, Star } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { approveReviewAction, rejectReviewAction } from "@/core/reviews/actions";
import { cn } from "@/lib/utils";
import type { AdminReviewRow } from "@/core/admin/service";

export function ReviewModerationRow({ review, productLabel }: { review: AdminReviewRow; productLabel: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function act(fn: (id: string) => Promise<{ ok: boolean }>) {
    startTransition(async () => {
      await fn(review.id);
      router.refresh();
    });
  }

  return (
    <li className="flex flex-col gap-3 rounded-[--radius] border border-border p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium">{productLabel}</p>
          <div className="flex items-center gap-0.5" aria-hidden>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} className={cn("size-3.5", n <= review.rating ? "fill-primary text-primary" : "text-border")} />
            ))}
          </div>
        </div>
        {review.body && <p className="mt-1.5 text-sm text-muted-foreground">{review.body}</p>}
        <p className="mt-1.5 text-xs text-muted-foreground">
          {review.authorName ?? "—"} · {new Date(review.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => act(approveReviewAction)}
          className="flex items-center gap-1.5 rounded-[--radius] border border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-success hover:border-success disabled:opacity-50"
        >
          <Check className="size-3.5" /> Approve
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => act(rejectReviewAction)}
          className="flex items-center gap-1.5 rounded-[--radius] border border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-accent hover:border-accent disabled:opacity-50"
        >
          <X className="size-3.5" /> Reject
        </button>
      </div>
    </li>
  );
}
