"use client";

import { useState } from 'react';
import { Phone, MapPin, ShoppingBag, CreditCard } from 'lucide-react';
import { CourierOrder } from '@/types/courier';
import { OrderStatus } from '@/types/orders';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CourierOrderCardProps {
  order: CourierOrder;
  isSelected?: boolean;
  onSelect?: () => void;
  onStatusChange?: (orderId: string, prev: OrderStatus, next: OrderStatus) => Promise<void>;
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  bancolombia: 'Bancolombia',
  nequi: 'Nequi',
};

const STATUS_TRANSITIONS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  ready_for_pickup: { next: 'dispatched', label: 'Iniciar entrega' },
  dispatched: { next: 'delivered', label: 'Marcar entregado' },
};

const formatCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

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
  console.log('Rendering CourierOrderCard for order:', order.id, 'Selected:', isSelected, order);

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
          {/* Número de orden + cliente */}
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="text-sm font-bold bg-primary-red text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0">
              {order.dailyOrderNumber}
            </span>
            <div className="min-w-0">
              <p className="font-bold text-base text-neutral-black-80 leading-tight truncate">
                {order.client?.name ?? 'Cliente'}
              </p>
              {order.client?.phone && (
                <a
                  href={`tel:${order.client.phone}`}
                  className="flex items-center gap-1 text-xs text-neutral-black-50 hover:text-primary-red mt-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone size={11} />
                  {order.client.phone}
                </a>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="text-right shrink-0">
            <p className="text-xs text-neutral-black-50 leading-none mb-0.5">Total</p>
            <p className="text-lg font-bold text-neutral-black-80">{formatCOP(order.totalPrice)}</p>
          </div>
        </div>

        {/* Dirección */}
        <div className="flex items-start gap-1.5 mt-3 bg-neutral-black-5 rounded-xl px-3 py-2">
          <MapPin size={14} className="text-primary-red mt-0.5 shrink-0" />
          <p className="text-sm text-neutral-black-80 leading-snug">
            {order.deliveryAddress?.address ?? 'Sin dirección'}
            {order.deliveryAddress?.floor && (
              <span className="text-neutral-black-50"> — {order.deliveryAddress.floor}</span>
            )}
          </p>
        </div>
      </div>

      {/* Productos */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-1.5 mb-2">
          <ShoppingBag size={13} className="text-neutral-black-50" />
          <span className="text-xs font-semibold text-neutral-black-50 uppercase tracking-wide">Productos</span>
        </div>
        <ul className="space-y-1.5">
          {order.orderItems.map((item) => (
            <li key={item.id} className="flex items-baseline justify-between gap-2">
              <span className="text-sm text-neutral-black-80">
                <span className="font-bold text-primary-red">{item.quantity}×</span>{' '}
                {item.name}
              </span>
              <span className="text-xs text-neutral-black-50 shrink-0">{formatCOP(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        {order.comment && (
          <p className="mt-2 text-xs text-neutral-black-50 italic border-l-2 border-neutral-black-20 pl-2">
            {order.comment}
          </p>
        )}
      </div>

      {/* Footer: método de pago + acción */}
      <div className="px-4 pb-4 pt-2 border-t border-neutral-black-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <CreditCard size={13} className="text-neutral-black-50" />
          <span className="text-xs text-neutral-black-80 font-medium">
            {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
          </span>
        </div>

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
