import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only star rating (supports halves visually by rounding). */
export function Stars({ rating, className, size = 16 }: { rating: number; className?: string; size?: number }) {
  const rounded = Math.round(rating);
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${rating.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= rounded ? "fill-gold text-gold" : "fill-transparent text-border"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}
