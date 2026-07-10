import { Skeleton } from "@/components/ui/Skeleton";

/** Dashboard loading state (stat cards) — falls back for any /admin page without a more specific loading.tsx. */
export default function AdminDashboardLoading() {
  return (
    <div>
      <Skeleton className="mb-8 h-8 w-40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] w-full" />
        ))}
      </div>
    </div>
  );
}
