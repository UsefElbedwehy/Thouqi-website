import { Skeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";
import { ProductGridSkeleton } from "@/components/catalog/ProductCardSkeleton";

export default function BrandLoading() {
  return (
    <Container className="py-10">
      <Skeleton className="mx-auto h-8 w-56" />
      <div className="mt-8">
        <ProductGridSkeleton />
      </div>
    </Container>
  );
}
