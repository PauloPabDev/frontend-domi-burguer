"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { WorkerOrder } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { Button } from '@/components/ui/button';
import { StatusStepBar, StatusStep } from '@/components/ui/StatusStepBar';
import { OrderItemsList } from '@/components/ui/OrderItemsList';
import { OrderCardNumber } from '@/components/ui/OrderCardNumber';
import { OrderClientInfo } from '@/components/ui/OrderClientInfo';
import { OrderStatusStrip } from '@/components/ui/OrderStatusStrip';
import { OrderComment } from '@/components/ui/OrderComment';

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
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const transition = COOK_TRANSITIONS[order.status];

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
      {transition && (
        <div className="px-4 pb-4 pt-2">
          {confirming ? (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                disabled={loading}
                className="flex-1 text-sm font-medium text-neutral-black-50 hover:text-neutral-black-80 border border-neutral-black-20 rounded-xl py-2.5 transition-colors disabled:opacity-40"
              >
                Cancelar
              </button>
              <div className="flex-1">
                <Button
                  onClick={handleStatusChange}
                  loading={loading}
                  loadingText="Actualizando..."
                  fullWidth
                  size="md"
                  variant={transition.variant}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setConfirming(true)}
              fullWidth
              size="md"
              variant={transition.variant}
            >
              {transition.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
