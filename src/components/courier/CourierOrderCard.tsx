"use client";

import { CourierOrder } from '@/types/courier';
import { OrderStatus } from '@/types/orders';
import { OrderItemsList } from '@/components/ui/OrderItemsList';
import { OrderAddressRow } from '@/components/ui/OrderAddressRow';
import { OrderActionButtons } from '@/components/ui/OrderActionButtons';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { OrderNumberChip, OrderClientChip, OrderTimeChip } from '@/components/ui/OrderClientChips';
import { OrderPaymentRow } from '@/components/ui/OrderPaymentRow';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/dates';

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

const SECTION = 'border-t border-neutral-black-10 p-4';

export const CourierOrderCard: React.FC<CourierOrderCardProps> = ({
  order,
  isSelected,
  onSelect,
  onStatusChange,
}) => {
  const transition = STATUS_TRANSITIONS[order.status];

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white shadow-sm transition-all duration-200 overflow-hidden',
        isSelected ? 'border-primary-red ring-2 ring-primary-red/20' : 'border-neutral-black-20',
      )}
      onClick={onSelect}
    >
      {/* Cliente */}
      <div className="p-4 flex items-center gap-2">
        <OrderNumberChip orderNumber={order.dailyOrderNumber} />
        <OrderClientChip
          name={order.client?.name}
          phone={order.client?.phone}
          clientId={order.clientId}
        />
        <OrderTimeChip time={formatTime(order.createdAt)} className="ml-auto" />
      </div>

      {/* Dirección */}
      <div className={SECTION}>
        <OrderAddressRow
          location={order.location}
          address={order.deliveryAddress?.address}
          floor={order.deliveryAddress?.floor}
        />
      </div>

      {/* Productos */}
      <div className={SECTION}>
        <OrderItemsList items={order.orderItems} />
        {order.comment && (
          <p className="mt-2 text-xs text-neutral-black-50 italic border-l-2 border-neutral-black-20 pl-2">
            {order.comment}
          </p>
        )}
      </div>

      {/* Pago */}
      <div className={SECTION}>
        <OrderPaymentRow
          paymentMethod={order.paymentMethod}
          total={order.totalPrice}
          paid={order.payment?.status === 'approved'}
        />
      </div>

      {/* Footer: estado + acción */}
      <div className={cn(SECTION, 'flex items-center justify-between gap-3')}>
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
