import { Skeleton } from "@/components/ui/skeleton";

// Fallback de GoogleReviewsSection: mismos wrappers, grid y anchos para que no haya salto al cargar
export function ReviewsSkeleton() {
  return (
    <section role="status" aria-label="Cargando opiniones" className="w-full py-8 sm:py-14 lg:py-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 lg:gap-8">
        <div className="flex flex-col items-start gap-3">
          <Skeleton className="h-7 w-28 rounded-full" />
          <Skeleton className="h-[126px] w-full max-w-[640px] lg:h-[58px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-4 lg:gap-6">
          <Skeleton className="h-[220px] rounded-[28px] lg:h-full lg:min-h-[400px] lg:rounded-[32px]" />

          <div className="-mx-4 flex gap-3 overflow-x-hidden px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:px-0">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[220px] shrink-0 basis-[300px] rounded-3xl lg:basis-auto" />
            ))}
          </div>
        </div>

        <Skeleton className="h-9 w-full max-w-[760px] lg:h-10" />
      </div>
    </section>
  );
}
