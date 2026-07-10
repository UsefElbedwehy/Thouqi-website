import { cn } from "@/lib/utils";

/** Shimmering placeholder block. Compose with utility classes for shape (size, rounding, aspect ratio). */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-[--radius]", className)} aria-hidden />;
}
