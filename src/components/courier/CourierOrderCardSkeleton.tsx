import { Skeleton } from '@/components/ui/skeleton';

// Misma estructura que CourierOrderCard: franja, cabecera, cliente, dirección, ítems, total y acciones.
const SECTION = 'border-t border-neutral-black-10 px-4 py-3';

export const CourierOrderCardSkeleton: React.FC = () => (
  <div
    role="status"
    aria-label="Cargando pedido"
    className="rounded-3xl border border-neutral-black-20 bg-white shadow-sm overflow-hidden"
  >
    <Skeleton className="h-1 w-full rounded-none" />

    <div className="px-4 py-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="ml-auto h-3 w-16" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </div>

    <div className={`${SECTION} space-y-2`}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>

    <div className={`${SECTION} flex items-center gap-2`}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="ml-auto h-5 w-20" />
    </div>

    <div className={`${SECTION} bg-neutral-black-5/60 space-y-2`}>
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  </div>
);

// Un slot por tarjeta, con los mismos wrappers que la página: en móvil 2 (1 visible + asomo), en desktop 3.
export const CourierOrderCardSkeletonSlots: React.FC = () => (
  <>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={`snap-center shrink-0 w-[85vw] max-w-sm lg:w-full lg:max-w-none lg:shrink-0 lg:snap-align-none ${i === 2 ? 'hidden lg:block' : ''}`}
      >
        <CourierOrderCardSkeleton />
      </div>
    ))}
  </>
);
