import { Skeleton } from '@/components/ui/skeleton';
import { KANBAN_COLUMN_WIDTH } from './OrderKanbanColumn';

// Tarjetas por columna (la altura imita RecepcionOrderCard en vista completa)
const KANBAN_CARDS = [3, 3, 2, 2, 2, 2];

/** Reemplaza al contenido de `flex gap-2 min-w-max h-full` del tablero kanban */
export function RecepcionKanbanSkeleton() {
  return (
    <div role="status" aria-label="Cargando pedidos" className="flex gap-2 min-w-max h-full">
      {KANBAN_CARDS.map((cards, i) => (
        <div key={i} className="flex flex-col shrink-0 h-full" style={{ width: KANBAN_COLUMN_WIDTH }}>
          <Skeleton className="h-8 rounded-xl mb-2 shrink-0" />
          <div className="space-y-2 flex-1 overflow-hidden">
            {Array.from({ length: cards }, (_, j) => (
              <Skeleton key={j} className="h-64 rounded-[20px]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Reemplaza a RecepcionOrderList (vista simple): pestañas + filas */
export function RecepcionListSkeleton() {
  return (
    <div role="status" aria-label="Cargando pedidos" className="h-full flex flex-col gap-2 min-h-0">
      <div className="flex gap-1.5 overflow-hidden shrink-0">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-[30px] w-20 rounded-full shrink-0" />
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden pr-0.5">
        <div className="flex flex-wrap content-start gap-2">
          {Array.from({ length: 12 }, (_, i) => (
            <Skeleton
              key={i}
              className="grow basis-auto min-w-[min(100%,320px)] max-w-full md:max-w-[calc((100%-0.5rem)/2)] xl:max-w-[calc((100%-1rem)/3)] h-[54px] rounded-2xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
