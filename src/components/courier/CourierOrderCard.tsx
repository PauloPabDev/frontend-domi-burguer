"use client";

import { useState } from 'react';
import { Phone, MapPin, ShoppingBag, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
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

export const CourierOrderCard: React.FC<CourierOrderCardProps> = ({
  order,
  isSelected,
  onSelect,
  onStatusChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const transition = STATUS_TRANSITIONS[order.status];

  const handleStatusChange = async () => {
    if (!transition || !onStatusChange) return;
    setLoading(true);
    try {
      await onStatusChange(order.id, order.status, transition.next);
    } finally {
      setLoading(false);
    }
  };

  const formatCOP = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white shadow-sm transition-all duration-200',
        isSelected ? 'border-primary-red ring-2 ring-primary-red/20' : 'border-neutral-black-20',
      )}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={onSelect}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-primary-red text-white rounded-full w-7 h-7 flex items-center justify-center shrink-0">
              {order.dailyOrderNumber}
            </span>
            <div>
              <p className="font-semibold text-sm text-neutral-black-80 leading-tight">
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

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-black-80">{formatCOP(order.deliveryPrice)}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
              className="p-1 text-neutral-black-50 hover:text-neutral-black-80"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-1.5 mt-2">
          <MapPin size={13} className="text-neutral-black-50 mt-0.5 shrink-0" />
          <p className="text-xs text-neutral-black-50 line-clamp-2">
            {order.deliveryAddress?.address}
            {order.deliveryAddress?.floor && ` — ${order.deliveryAddress.floor}`}
          </p>
        </div>
      </div>

      {/* Expandable content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-neutral-black-10 pt-3">
          {/* Items */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ShoppingBag size={13} className="text-neutral-black-50" />
              <span className="text-xs font-semibold text-neutral-black-80">Productos</span>
            </div>
            <ul className="space-y-1">
              {order.orderItems.map((item) => (
                <li key={item.id} className="flex justify-between text-xs text-neutral-black-80">
                  <span>{item.quantity}× {item.name}</span>
                  <span className="text-neutral-black-50">{formatCOP(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment */}
          <div className="flex items-center gap-1.5">
            <CreditCard size={13} className="text-neutral-black-50" />
            <span className="text-xs text-neutral-black-80">
              {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
            </span>
          </div>

          {/* Comment */}
          {order.comment && (
            <p className="text-xs text-neutral-black-50 italic">"{order.comment}"</p>
          )}

          {/* Total */}
          <div className="flex justify-between text-xs font-semibold border-t border-neutral-black-10 pt-2">
            <span>Total pedido</span>
            <span>{formatCOP(order.totalPrice)}</span>
          </div>
        </div>
      )}

      {/* Status action */}
      {transition && (
        <div className="px-4 pb-4">
          <Button
            onClick={handleStatusChange}
            loading={loading}
            loadingText="Actualizando..."
            fullWidth
            size="md"
            variant={transition.next === 'delivered' || transition.next === 'dispatched' ? 'dark' : 'primary'}
          >
            {transition.label}
          </Button>
        </div>
      )}
    </div>
  );
};
