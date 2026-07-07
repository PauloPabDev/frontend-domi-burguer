"use client";

import { WorkerOrder, WorkerUser, WorkerKitchen, STATUS_CONFIG } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { RecepcionOrderCard } from './RecepcionOrderCard';
import { cn } from '@/lib/utils';

interface OrderKanbanColumnProps {
  status: OrderStatus;
  orders: WorkerOrder[];
  couriers: WorkerUser[];
  kitchens: WorkerKitchen[];
  onStatusChange: (orderId: string, prev: OrderStatus, next: OrderStatus) => Promise<void>;
  onAssignCourier: (orderId: string, courierId: string) => Promise<void>;
  onAssignKitchen: (orderId: string, kitchenId: string) => Promise<void>;
}

export const OrderKanbanColumn: React.FC<OrderKanbanColumnProps> = ({
  status,
  orders,
  couriers,
  kitchens,
  onStatusChange,
  onAssignCourier,
  onAssignKitchen,
}) => {
  const cfg = STATUS_CONFIG[status];

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
      <div className="space-y-2 flex-1 overflow-y-auto pr-0.5">
        {orders.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-black-50 border border-dashed border-neutral-black-20 rounded-xl">
            Sin pedidos
          </div>
        ) : (
          orders.map((order) => (
            <RecepcionOrderCard
              key={order.id}
              order={order}
              couriers={couriers}
              kitchens={kitchens}
              onStatusChange={onStatusChange}
              onAssignCourier={onAssignCourier}
              onAssignKitchen={onAssignKitchen}
            />
          ))
        )}
      </div>
    </div>
  );
};
