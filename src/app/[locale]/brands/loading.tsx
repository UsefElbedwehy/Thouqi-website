import { Skeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";

export default function BrandsLoading() {
  return (
    <Container className="py-12">
      <Skeleton className="mx-auto h-8 w-40" />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/2] w-full" />
        ))}
      </div>
    </Container>
  );
}
