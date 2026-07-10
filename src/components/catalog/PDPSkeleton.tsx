import { Skeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";

/** Matches ProductDetailPage's above-the-fold layout (gallery + info column). */
export function PDPSkeleton() {
  return (
    <Container className="py-6">
      <Skeleton className="h-4 w-64" />

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-[3/4] w-full" />

        <div className="lg:ps-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-5 w-48" />

          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-12" />
              ))}
            </div>
            <Skeleton className="h-12 w-full" />
          </div>

          <div className="mt-8 space-y-2">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
    </Container>
  );
}
