"use client";

import { useState } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { WorkerOrder } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { StatusStepBar, StatusStep } from '@/components/ui/StatusStepBar';
import { OrderItemsList } from '@/components/ui/OrderItemsList';
import { OrderStatusStrip } from '@/components/ui/OrderStatusStrip';
import { OrderComment } from '@/components/ui/OrderComment';
import { OrderActionButtons } from '@/components/ui/OrderActionButtons';
import { OrderAddressRow } from '@/components/ui/OrderAddressRow';
import { OrderNumberChip, OrderClientChip, OrderTimeChip } from '@/components/ui/OrderClientChips';
import { formatTime } from '@/lib/dates';

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

const SECTION = 'border-t border-neutral-black-10 p-4';

export const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({ order, onStatusChange }) => {
  const [addressOpen, setAddressOpen] = useState(false);

  const transition = COOK_TRANSITIONS[order.status];

  return (
    <div className="rounded-2xl border border-neutral-black-20 bg-white shadow-sm overflow-hidden">
      <OrderStatusStrip status={order.status} />

      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2">
          <OrderNumberChip orderNumber={order.dailyOrderNumber} />
          <OrderClientChip
            name={order.client?.name}
            phone={order.client?.phone}
            clientId={order.clientId}
          />
          <OrderTimeChip time={formatTime(order.createdAt)} className="ml-auto" />
        </div>

        <div className="mt-3 px-1">
          <StatusStepBar steps={KITCHEN_STEPS} currentStatus={order.status} />
        </div>

        {order.comment && <OrderComment comment={order.comment} className="mt-3" />}
      </div>

      {/* Productos */}
      <div className={SECTION}>
        <p className="text-[10px] font-bold text-neutral-black-50 uppercase tracking-wide mb-3">Productos</p>
        <OrderItemsList items={order.orderItems} circleQty />
      </div>

      {/* Dirección colapsable */}
      <div className={SECTION}>
        <button
          type="button"
          onClick={() => setAddressOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-black-50 hover:text-neutral-black-80 transition-colors"
        >
          <MapPin size={13} />
          Ver dirección
          {addressOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {addressOpen && (
          <div className="mt-3">
            <OrderAddressRow
              location={order.location}
              address={order.deliveryAddress?.address}
              floor={order.deliveryAddress?.floor}
            />
          </div>
        )}
      </div>

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
