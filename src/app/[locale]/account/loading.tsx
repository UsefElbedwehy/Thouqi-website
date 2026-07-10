import { Skeleton } from "@/components/ui/Skeleton";

/** Generic account-section loading state (overview/orders/addresses/security). */
export default function AccountLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}
