import { Skeleton } from '@/components/ui/skeleton';
import { CourierOrderCardSkeletonSlots } from '@/components/courier/CourierOrderCardSkeleton';

// Chrome + layout de la página mientras carga la sesión: barra del CourierNavbar, mapa y zona de tarjetas.
export const DomiciliarioSkeleton: React.FC = () => (
  <div role="status" aria-label="Cargando domiciliario">
    <div className="fixed top-0 left-0 z-40 hidden w-full px-4 md:block">
      <Skeleton className="max-w-[828px] md:h-[80px] h-[62px] mt-[20px] mb-[10px] rounded-[60px] w-full mx-auto" />
    </div>
    <main className="max-w-screen-xl mx-auto px-4 lg:px-6 mt-4 h-[calc(100dvh-1rem)] md:mt-[110px] md:h-[calc(100dvh-110px)] overflow-hidden">
      <div className="h-full flex flex-col lg:flex-row py-3 gap-3">
        <Skeleton className="rounded-2xl h-[45%] shrink-0 lg:h-full lg:flex-1" />
        <div className="flex-1 min-h-0 flex flex-col lg:w-[360px] lg:flex-none">
          <div className="flex gap-3 overflow-hidden pb-2 px-1 h-full items-start lg:flex-col lg:px-0 lg:items-stretch">
            <CourierOrderCardSkeletonSlots />
          </div>
        </div>
      </div>
    </main>
  </div>
);
