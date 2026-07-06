"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { WorkerOrder } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { StatusStepBar, StatusStep } from '@/components/ui/StatusStepBar';
import { OrderItemsList } from '@/components/ui/OrderItemsList';
import { OrderCardNumber } from '@/components/ui/OrderCardNumber';
import { OrderClientInfo } from '@/components/ui/OrderClientInfo';
import { OrderStatusStrip } from '@/components/ui/OrderStatusStrip';
import { OrderComment } from '@/components/ui/OrderComment';
import { OrderActionButtons } from '@/components/ui/OrderActionButtons';

const KITCHEN_STEPS: StatusStep[] = [
  { key: 'fresh', label: 'Nuevo' },
  { key: 'preparing', label: 'Preparando' },
  { key: 'ready_for_pickup', label: 'Listo' },
];

interface KitchenOrderCardProps {
  order: WorkerOrder;
  onStatusChange?: (orderId: string, prev: OrderStatus, next: OrderStatus) => Promise<void>;
}

const COOK_TRANSITIONS: Partial<Record<OrderStatus, { next: OrderStatus; label: string; variant: 'primary' | 'dark' }>> = {
  fresh:     { next: 'preparing',        label: 'Preparar',            variant: 'primary' },
  preparing: { next: 'ready_for_pickup', label: 'Listo para despacho', variant: 'dark' },
};

export const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({ order, onStatusChange }) => {
  const [expanded, setExpanded] = useState(true);

  const transition = COOK_TRANSITIONS[order.status];

  return (
    <div className="rounded-2xl border border-neutral-black-20 bg-white shadow-sm overflow-hidden">
      <OrderStatusStrip status={order.status} />

      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <OrderCardNumber number={order.dailyOrderNumber} />
            <OrderClientInfo name={order.client?.name} phone={order.client?.phone} />
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 text-neutral-black-50 hover:text-neutral-black-80 shrink-0"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        <div className="mt-3 px-1">
          <StatusStepBar steps={KITCHEN_STEPS} currentStatus={order.status} />
        </div>

        {order.comment && <OrderComment comment={order.comment} className="mt-3" />}
      </div>

      {/* Productos (expandible) */}
      {expanded && (
        <div className="px-4 pb-3 border-t border-neutral-black-10 pt-3">
          <p className="text-[10px] font-bold text-neutral-black-50 uppercase tracking-wide mb-3">Productos</p>
          <OrderItemsList items={order.orderItems} circleQty />
        </div>
      )}

      {/* Acción */}
      {transition && onStatusChange && (
        <div className="px-4 pb-4 pt-2">
          <OrderActionButtons
            label={transition.label}
            variant={transition.variant}
            size="md"
            fullWidth
            onConfirm={() => onStatusChange(order.id, order.status, transition.next)}
          />
        </div>
      )}
    </div>
  );
};
