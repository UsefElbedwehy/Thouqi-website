import { Skeleton } from "@/components/ui/Skeleton";

/** Generic admin list/table skeleton — heading + N rows. */
export function AdminTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="overflow-hidden rounded-[--radius] border border-border">
        <div className="border-b border-border bg-muted/50 p-3">
          <Skeleton className="h-3 w-full max-w-xs" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="size-11 shrink-0" />
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3.5 w-1/6" />
              <Skeleton className="ms-auto h-3.5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
