"use client";

import { ShoppingBag } from 'lucide-react';
import { CourierOrder } from '@/types/courier';
import { OrderStatus } from '@/types/orders';
import { OrderItemsList, formatCOP } from '@/components/ui/OrderItemsList';
import { OrderAddressRow } from '@/components/ui/OrderAddressRow';
import { OrderActionButtons } from '@/components/ui/OrderActionButtons';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { OrderClientChips } from '@/components/ui/OrderClientChips';
import { cn } from '@/lib/utils';
import { OrderPaymentRow } from '../ui/OrderPaymentRow';

interface CourierOrderCardProps {
  order: CourierOrder;
  isSelected?: boolean;
  onSelect?: () => void;
  onStatusChange?: (orderId: string, prev: OrderStatus, next: OrderStatus) => Promise<void>;
}

const STATUS_TRANSITIONS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  ready_for_pickup: { next: 'dispatched', label: 'Iniciar entrega' },
  dispatched: { next: 'delivered', label: 'Marcar entregado' },
};

export const CourierOrderCard: React.FC<CourierOrderCardProps> = ({
  order,
  isSelected,
  onSelect,
  onStatusChange,
}) => {
  const transition = STATUS_TRANSITIONS[order.status];
  console.log(order)
  return (
    <div
      className={cn(
        'rounded-2xl border bg-white shadow-sm transition-all duration-200 overflow-hidden',
        isSelected ? 'border-primary-red ring-2 ring-primary-red/20' : 'border-neutral-black-20',
      )}
      onClick={onSelect}
    >
      {/* Header: número, cliente, total */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <OrderClientChips
            name={order.client?.name}
            phone={order.client?.phone}
            clientId={order.clientId}
            orderNumber={order.dailyOrderNumber}
          />

          <div className="text-right shrink-0">
            <p className="text-xs text-neutral-black-50 leading-none mb-0.5">

              <OrderPaymentRow paymentMethod={order.paymentMethod} className="text-xs text-neutral-black-50 leading-none mb-0.5" />
            </p>
            {/* si ya pago se subraya*/}
            <p className={"text-lg font-bold " + (order?.payment?.status === 'approved' ? ' line-through text-green-500' : 'text-neutral-black-80')}>
              {formatCOP(order.totalPrice)}
            </p>
          </div>
        </div>

        <OrderAddressRow
          location={order.location}
          address={order.deliveryAddress?.address}
          floor={order.deliveryAddress?.floor}
          className="mt-3"
        />
      </div>

      {/* Productos */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-1.5 mb-2">
          <ShoppingBag size={13} className="text-neutral-black-50" />
          <span className="text-xs font-semibold text-neutral-black-50 uppercase tracking-wide">Productos</span>
        </div>
        <OrderItemsList items={order.orderItems} />
        {order.comment && (
          <p className="mt-2 text-xs text-neutral-black-50 italic border-l-2 border-neutral-black-20 pl-2">
            {order.comment}
          </p>
        )}
      </div>

      {/* Footer: estado + acción */}
      <div className="px-3 pb-3 pt-3 border-t border-neutral-black-10 flex items-center justify-between gap-3">
        <OrderStatusBadge status={order.status} />

        {transition && onStatusChange && (
          <OrderActionButtons
            label={transition.label}
            variant={transition.next === 'delivered' ? 'dark' : 'primary'}
            onConfirm={() => onStatusChange(order.id, order.status, transition.next)}
            stopPropagation
            className="ml-auto"
          />
        )}
      </div>
    </div>
  );
};
