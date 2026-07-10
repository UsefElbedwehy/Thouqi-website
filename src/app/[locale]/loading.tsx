import { Skeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";
import { ProductGridSkeleton } from "@/components/catalog/ProductCardSkeleton";

export default function HomeLoading() {
  return (
    <div>
      <Skeleton className="h-[68vh] min-h-[460px] w-full rounded-none" />
      <Container className="py-16">
        <Skeleton className="mx-auto h-4 w-32" />
        <div className="mt-8">
          <ProductGridSkeleton count={8} />
        </div>
      </Container>
    </div>
  );
}
