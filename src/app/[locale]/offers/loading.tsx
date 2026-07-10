import { Skeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";
import { ProductGridSkeleton } from "@/components/catalog/ProductCardSkeleton";

export default function OffersLoading() {
  return (
    <Container className="py-6">
      <Skeleton className="h-6 w-40" />
      <div className="mt-4 flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="mt-6">
        <ProductGridSkeleton />
      </div>
    </Container>
  );
}
