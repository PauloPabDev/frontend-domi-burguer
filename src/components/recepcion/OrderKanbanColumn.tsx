"use client";

import { useRef, useCallback } from 'react';
import { WorkerOrder, WorkerKitchen, STATUS_CONFIG } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { RecepcionOrderCard } from './RecepcionOrderCard';
import { cn } from '@/lib/utils';

interface OrderKanbanColumnProps {
  status: OrderStatus;
  orders: WorkerOrder[];
  kitchens: WorkerKitchen[];
  onStatusChange: (orderId: string, prev: OrderStatus, next: OrderStatus) => Promise<void>;
  onAssignCourier: (orderId: string, courierId: string) => Promise<void>;
  onAssignKitchen: (orderId: string, kitchenId: string) => Promise<void>;
  onPaymentMethodChange?: (orderId: string, method: string) => Promise<void>;
  onMarkPaid?: (orderId: string) => Promise<void>;
}

function blend(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

export const OrderKanbanColumn: React.FC<OrderKanbanColumnProps> = ({
  status,
  orders,
  kitchens,
  onStatusChange,
  onAssignCourier,
  onAssignKitchen,
  onPaymentMethodChange,
  onMarkPaid,
}) => {
  const cfg = STATUS_CONFIG[status];
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 0) return;

    // Curva cuadrática: el color cambia más rápido cerca del fondo
    const pct = Math.min(el.scrollTop / max, 1);
    const eased = pct ** 1.8;

    // gris neutro → rojo
    const r = blend(212, 239, eased);
    const g = blend(212, 68, eased);
    const b = blend(212, 68, eased);

    el.style.setProperty('--scroll-thumb', `rgb(${r} ${g} ${b})`);
  }, []);

  return (
    <div className="flex flex-col min-w-[240px] flex-1 h-full">
      {/* Column header */}
      <div className={cn('flex items-center gap-2 px-3 py-2 rounded-xl mb-2 shrink-0', cfg.bg)}>
        <div className={cn('w-2 h-2 rounded-full', cfg.dotColor)} />
        <span className={cn('text-xs font-bold', cfg.color)}>{cfg.label}</span>
        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/60', cfg.color)}>
          {orders.length}
        </span>
      </div>

      {/* Cards */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="kanban-scroll space-y-2 flex-1 overflow-y-auto pr-0.5"
      >
        {orders.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-black-50 border border-dashed border-neutral-black-20 rounded-xl">
            Sin pedidos
          </div>
        ) : (
          orders.map((order) => (
            <RecepcionOrderCard
              key={order.id}
              order={order}
              kitchens={kitchens}
              onStatusChange={onStatusChange}
              onAssignCourier={onAssignCourier}
              onAssignKitchen={onAssignKitchen}
              onPaymentMethodChange={onPaymentMethodChange}
              onMarkPaid={onMarkPaid}
            />
          ))
        )}
      </div>
    </div>
  );
};
