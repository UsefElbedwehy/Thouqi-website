import { setRequestLocale } from "next-intl/server";
import { listPendingReviews } from "@/core/admin/service";
import { t } from "@/lib/format";
import { ReviewModerationRow } from "@/components/admin/ReviewModerationRow";

export default async function AdminReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const reviews = await listPendingReviews();

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-semibold uppercase tracking-[0.06em]">Reviews</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Approve or reject reviews submitted by customers. Approved reviews appear on the product page immediately.
      </p>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews awaiting moderation.</p>
      ) : (
        <ul className="max-w-2xl space-y-3">
          {reviews.map((r) => (
            <ReviewModerationRow key={r.id} review={r} productLabel={r.productName ? t(r.productName, locale) : r.productId} />
          ))}
        </ul>
      )}
    </div>
  );
}
