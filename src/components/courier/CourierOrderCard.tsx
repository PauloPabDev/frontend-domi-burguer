"use client";

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { CourierOrder } from '@/types/courier';
import { OrderStatus } from '@/types/orders';
import { Button } from '@/components/ui/button';
import { StatusStepBar, StatusStep } from '@/components/ui/StatusStepBar';
import { OrderItemsList, formatCOP } from '@/components/ui/OrderItemsList';
import { OrderCardNumber } from '@/components/ui/OrderCardNumber';
import { OrderClientInfo } from '@/components/ui/OrderClientInfo';
import { OrderAddressRow } from '@/components/ui/OrderAddressRow';
import { OrderPaymentRow } from '@/components/ui/OrderPaymentRow';
import { cn } from '@/lib/utils';

const COURIER_STEPS: StatusStep[] = [
  { key: 'ready_for_pickup', label: 'Listo' },
  { key: 'dispatched', label: 'En camino' },
  { key: 'delivered', label: 'Entregado' },
];

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
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const transition = STATUS_TRANSITIONS[order.status];

  const handleStatusChange = async () => {
    if (!transition || !onStatusChange) return;
    setLoading(true);
    try {
      await onStatusChange(order.id, order.status, transition.next);
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="flex items-start gap-2.5 min-w-0">
            <OrderCardNumber number={order.dailyOrderNumber} className="mt-0.5" />
            <OrderClientInfo
              name={order.client?.name}
              phone={order.client?.phone}
              nameSize="base"
              onPhoneClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="text-right shrink-0">
            <p className="text-xs text-neutral-black-50 leading-none mb-0.5">Total</p>
            <p className="text-lg font-bold text-neutral-black-80">{formatCOP(order.totalPrice)}</p>
          </div>
        </div>

        <div className="mt-3 px-1">
          <StatusStepBar steps={COURIER_STEPS} currentStatus={order.status} />
        </div>

        <OrderAddressRow
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

      {/* Footer: método de pago + acción */}
      <div className="px-4 pb-4 pt-2 border-t border-neutral-black-10 flex items-center justify-between gap-3">
        <OrderPaymentRow paymentMethod={order.paymentMethod} />

        {transition && (
          confirming ? (
            <div className="flex items-center gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setConfirming(false)}
                disabled={loading}
                className="text-xs font-medium text-neutral-black-50 hover:text-neutral-black-80 border border-neutral-black-20 rounded-xl px-3 py-1.5 transition-colors disabled:opacity-40"
              >
                Cancelar
              </button>
              <Button
                onClick={(e) => { e.stopPropagation(); handleStatusChange(); }}
                loading={loading}
                loadingText="..."
                size="sm"
                variant={transition.next === 'delivered' ? 'dark' : 'primary'}
              >
                Confirmar
              </Button>
            </div>
          ) : (
            <Button
              onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
              size="sm"
              variant={transition.next === 'delivered' ? 'dark' : 'primary'}
            >
              {transition.label}
            </Button>
          )
        )}
      </div>
    </div>
  );
};
