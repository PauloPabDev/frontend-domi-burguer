import { Skeleton } from '@/components/ui/skeleton';

// Imita el bloque "Contenido" de la página: botón de estadísticas, StatCards y lista de pedidos
export function ContabilidadSkeleton() {
  return (
    <div role="status" aria-label="Cargando pedidos" className="space-y-4">
      <Skeleton className="h-[46px] rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[140px] rounded-2xl" />
        ))}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-[74px] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
