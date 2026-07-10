import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminReviewsLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-96" />
      <ul className="mt-8 max-w-2xl space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="rounded-[--radius] border border-border p-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-24" />
          </li>
        ))}
      </ul>
    </div>
  );
}
