import { Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getProductReviews } from "@/core/reviews/service";
import { getCurrentUser } from "@/core/auth/user";
import { cn } from "@/lib/utils";
import { ReviewForm } from "./ReviewForm";

function Stars({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn(size, n <= Math.round(value) ? "fill-primary text-primary" : "text-border")} />
      ))}
    </div>
  );
}

/** Product reviews: average rating summary, approved review list, submit form. */
export async function ReviewsSection({
  productId,
  slug,
  locale,
}: {
  productId: string;
  slug: string;
  locale: string;
}) {
  const [{ reviews, average, count }, user, tr] = await Promise.all([
    getProductReviews(productId),
    getCurrentUser(),
    getTranslations("reviews"),
  ]);

  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.04em]">{tr("title")}</h2>

      <div className="mt-3 flex items-center gap-3">
        <Stars value={average} size="size-5" />
        <span className="text-sm text-muted-foreground">
          {count > 0 ? tr("basedOn", { count }) : tr("noReviews")}
        </span>
      </div>

      {reviews.length > 0 && (
        <ul className="mt-8 space-y-6">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-border pb-6">
              <div className="flex items-center justify-between gap-3">
                <Stars value={r.rating} />
                <span className="text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString(locale === "ar" ? "ar-KW" : "en-KW")}
                </span>
              </div>
              {r.body && <p className="mt-2 text-sm text-foreground">{r.body}</p>}
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {r.authorName ?? ""}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <ReviewForm productId={productId} slug={slug} signedIn={!!user} />
      </div>
    </section>
  );
}
