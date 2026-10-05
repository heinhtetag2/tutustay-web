import { Container } from "@/shared/layout/Container";
import { Skeleton } from "@/shared/ui/Skeleton";

/** Loading state: skeletons match the final layout (summary bar, filters, result cards). */
export default function Loading() {
  return (
    <Container size="wide" className="py-6" >
      <Skeleton className="h-24 w-full" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Skeleton className="hidden h-96 lg:block" />
        <div className="flex flex-col gap-4" role="status" aria-label="Loading stays">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      </div>
    </Container>
  );
}
