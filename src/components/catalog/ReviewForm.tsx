"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { submitReviewAction } from "@/core/reviews/actions";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Star-rating picker + comment; submits a pending (unapproved) review. */
export function ReviewForm({ productId, slug, signedIn }: { productId: string; slug: string; signedIn: boolean }) {
  const tr = useTranslations("reviews");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");

  if (!signedIn) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          {tr("signInToReview")}
        </Link>
      </p>
    );
  }

  if (status === "done") {
    return <p className="text-sm text-success">{tr("submitted")}</p>;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return;
    startTransition(async () => {
      const r = await submitReviewAction({ productId, slug, rating, body });
      setStatus(r.ok ? "done" : "error");
    });
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide">{tr("writeReview")}</h3>

      <div>
        <span className="mb-1 block text-xs font-medium text-muted-foreground">{tr("rating")}</span>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n}`}
            >
              <Star className={cn("size-6", n <= (hover || rating) ? "fill-primary text-primary" : "text-border")} />
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">{tr("comment")}</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={2000}
          className="w-full rounded-[--radius] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </label>

      {status === "error" && <p className="text-sm text-accent">{tr("error")}</p>}

      <button
        type="submit"
        disabled={pending || !rating}
        className="rounded-[--radius] bg-foreground px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
      >
        {tr("submit")}
      </button>
    </form>
  );
}
