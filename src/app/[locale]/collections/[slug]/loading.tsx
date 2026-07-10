import { Skeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";
import { ProductGridSkeleton } from "@/components/catalog/ProductCardSkeleton";

export default function CollectionLoading() {
  return (
    <div>
      <Skeleton className="aspect-[21/8] w-full rounded-none" />
      <Container className="py-10">
        <ProductGridSkeleton />
      </Container>
    </div>
  );
}
