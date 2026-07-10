import { Skeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";
import { ProductGridSkeleton } from "@/components/catalog/ProductCardSkeleton";

export default function CategoryLoading() {
  return (
    <Container className="py-6">
      <Skeleton className="h-4 w-56" />

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <div className="hidden w-56 shrink-0 space-y-4 lg:block">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-32 w-full" />
        </div>

        <div className="min-w-0 flex-1">
          <Skeleton className="mx-auto h-6 w-48" />
          <div className="mt-4 flex justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="mt-6">
            <ProductGridSkeleton />
          </div>
        </div>
      </div>
    </Container>
  );
}
