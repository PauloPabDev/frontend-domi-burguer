"use client";

import { useState } from 'react';
import { WorkerOrder, WorkerKitchen, STATUS_CONFIG } from '@/types/worker';
import { OrderStatus, PaymentStatus } from '@/types/orders';
import { PaymentChangeRequestInput } from '@/types/paymentChangeRequest';
import { RecepcionOrderCard } from './RecepcionOrderCard';
import { RecepcionOrderDetailModal } from './RecepcionOrderDetailModal';
import { cn } from '@/lib/utils';

// Estados "en curso": la pestaña En curso los junta en una sola lista
const ACTIVE_STATUSES: OrderStatus[] = ['fresh', 'preparing', 'ready_for_pickup', 'dispatched'];
// Estados que se revisan aparte (crecen durante el día y se miran menos)
const CLOSING_STATUSES: OrderStatus[] = ['delivered', 'pending_payment'];
// "Todas" (pestaña por defecto): las órdenes actuales en cualquier estado del tablero
const ALL_STATUSES: OrderStatus[] = [...ACTIVE_STATUSES, ...CLOSING_STATUSES];

type ListFilter = 'all' | 'active' | OrderStatus;

const FILTER_STATUSES: Partial<Record<ListFilter, OrderStatus[]>> = {
  all: ALL_STATUSES,
  active: ACTIVE_STATUSES,
};

interface RecepcionOrderListProps {
  orders: WorkerOrder[];
  kitchens: WorkerKitchen[];
  onStatusChange: (orderId: string, prev: OrderStatus, next: OrderStatus) => Promise<void>;
  onAssignCourier: (orderId: string, courierId: string | null) => Promise<void>;
  onAssignKitchen: (orderId: string, kitchenId: string) => Promise<void>;
  onDelete: (orderId: string) => Promise<void>;
  onPaymentMethodChange?: (orderId: string, previousMethod: string, method: string) => Promise<void>;
  onMarkPaid?: (orderId: string) => Promise<void>;
  onPaymentStatusChange?: (orderId: string, status: PaymentStatus) => Promise<void>;
  onRequestPaymentChange?: (orderId: string, input: PaymentChangeRequestInput) => Promise<void>;
}

/**
 * Vista simple de recepción: en vez de columnas por estado, una sola lista
 * ordenada por antigüedad (lo más demorado primero). El estado se lee en la
 * franja de color de cada card; las pestañas filtran y sirven de leyenda.
 *
 * Las cards van en filas que se llenan de izquierda a derecha: cada card mide
 * lo que ocupa su contenido y crece para repartir el sobrante de la fila,
 * con un tope de 1/3 del ancho (xl). Así, con órdenes largas quedan 3 por
 * fila, y con nombres y pedidos cortos entran más.
 */
export const RecepcionOrderList: React.FC<RecepcionOrderListProps> = ({ orders, ...cardHandlers }) => {
  const [filter, setFilter] = useState<ListFilter>('all');
  // Se guarda el id (no la orden) para que el modal refleje los cambios en vivo del socket;
  // si la orden desaparece (p. ej. se cancela), el modal se cierra solo.
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const detailOrder = detailOrderId ? orders.find((o) => o.id === detailOrderId) : undefined;

  const countFor = (statuses: OrderStatus[]) => orders.filter((o) => statuses.includes(o.status)).length;

  const tabs: { key: ListFilter; label: string; count: number; dots: string[] }[] = [
    { key: 'all', label: 'Todas', count: countFor(ALL_STATUSES), dots: [] },
    {
      key: 'active',
      label: 'En curso',
      count: countFor(ACTIVE_STATUSES),
      dots: ACTIVE_STATUSES.map((s) => STATUS_CONFIG[s].dotColor),
    },
    ...ALL_STATUSES.map((status) => ({
      key: status,
      label: STATUS_CONFIG[status].label,
      count: countFor([status]),
      dots: [STATUS_CONFIG[status].dotColor],
    })),
  ];

  const visibleStatuses = FILTER_STATUSES[filter] ?? [filter as OrderStatus];
  const visibleOrders = orders
    .filter((o) => visibleStatuses.includes(o.status))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="h-full flex flex-col gap-2 min-h-0">
      <div role="tablist" className="flex gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
        {tabs.map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors',
                isActive
                  ? 'bg-neutral-black-80 text-white border-transparent'
                  : 'bg-white text-neutral-black-80 border-neutral-black-20 hover:border-neutral-black-40'
              )}
            >
              {tab.dots.length > 0 && (
                <span className="flex -space-x-0.5">
                  {tab.dots.map((dot) => (
                    <span key={dot} className={cn('w-2 h-2 rounded-full ring-1 ring-white', dot)} />
                  ))}
                </span>
              )}
              {tab.label}
              <span
                className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                  isActive ? 'bg-white/20' : 'bg-neutral-black-10'
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="kanban-scroll flex-1 min-h-0 overflow-y-auto pr-0.5">
        {visibleOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-black-20 flex items-start justify-center py-6 text-xs text-neutral-black-40">
            Sin órdenes
          </div>
        ) : (
          <div className="flex flex-wrap content-start gap-2">
            {visibleOrders.map((order) => (
              <div
                key={order.id}
                className="grow basis-auto min-w-[min(100%,320px)] max-w-full md:max-w-[calc((100%-0.5rem)/2)] xl:max-w-[calc((100%-1rem)/3)]"
              >
                <RecepcionOrderCard
                  order={order}
                  {...cardHandlers}
                  compact
                  onOpenDetail={() => setDetailOrderId(order.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {detailOrder && (
        <RecepcionOrderDetailModal
          order={detailOrder}
          {...cardHandlers}
          onClose={() => setDetailOrderId(null)}
        />
      )}
    </div>
  );
};
