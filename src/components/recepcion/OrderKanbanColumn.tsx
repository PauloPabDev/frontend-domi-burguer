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
  onAssignCourier: (orderId: string, courierId: string | null) => Promise<void>;
  onAssignKitchen: (orderId: string, kitchenId: string) => Promise<void>;
  onDelete: (orderId: string) => Promise<void>;
  onPaymentMethodChange?: (orderId: string, previousMethod: string, method: string) => Promise<void>;
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
  onDelete,
  onPaymentMethodChange,
  onMarkPaid,
}) => {
  const cfg = STATUS_CONFIG[status];
  const isEmpty = orders.length === 0;
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
    <div
      className={cn(
        'flex flex-col shrink-0 h-full transition-[width] duration-200 ease-out',
        isEmpty ? 'w-14' : 'w-[310px]'
      )}
    >
      {/* Column header */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl mb-2 shrink-0',
          cfg.bg,
          isEmpty && 'justify-center px-1.5'
        )}
      >
        <div className={cn('w-2 h-2 rounded-full shrink-0', cfg.dotColor)} />
        {!isEmpty && <span className={cn('text-xs font-bold truncate', cfg.color)}>{cfg.label}</span>}
        <span
          className={cn(
            'text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/60 shrink-0',
            cfg.color,
            isEmpty && 'ml-0'
          )}
        >
          {orders.length}
        </span>
      </div>

      {/* Cards */}
      {!isEmpty && (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="kanban-scroll space-y-2 flex-1 overflow-y-auto pr-0.5"
        >
          {orders.map((order) => (
            <RecepcionOrderCard
              key={order.id}
              order={order}
              kitchens={kitchens}
              onStatusChange={onStatusChange}
              onAssignCourier={onAssignCourier}
              onAssignKitchen={onAssignKitchen}
              onDelete={onDelete}
              onPaymentMethodChange={onPaymentMethodChange}
              onMarkPaid={onMarkPaid}
            />
          ))}
        </div>
      )}
    </div>
  );
};
