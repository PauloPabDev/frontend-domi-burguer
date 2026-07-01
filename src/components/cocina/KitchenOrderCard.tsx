"use client";

import { useState } from 'react';
import { Phone, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { WorkerOrder } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface KitchenOrderCardProps {
  order: WorkerOrder;
  onStatusChange?: (orderId: string, prev: OrderStatus, next: OrderStatus) => Promise<void>;
}

const COOK_TRANSITIONS: Partial<Record<OrderStatus, { next: OrderStatus; label: string; variant: 'primary' | 'dark' }>> = {
  fresh:     { next: 'preparing',        label: 'Preparar',             variant: 'primary' },
  preparing: { next: 'ready_for_pickup', label: 'Listo para despacho',  variant: 'dark' },
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

  const formatCOP = (v: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

  const statusColors: Record<string, string> = {
    fresh:     'bg-sky-100 text-sky-700',
    preparing: 'bg-violet-100 text-violet-700',
  };
  const statusLabels: Record<string, string> = {
    fresh:     'Nuevo',
    preparing: 'Preparando',
  };

  return (
    <div className="rounded-2xl border border-neutral-black-20 bg-white shadow-sm overflow-hidden">
      {/* Status bar */}
      <div className={cn('h-1.5', order.status === 'fresh' ? 'bg-sky-400' : 'bg-violet-500')} />

      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold bg-primary-red text-white rounded-full w-8 h-8 flex items-center justify-center shrink-0">
              {order.dailyOrderNumber}
            </span>
            <div>
              <p className="font-bold text-neutral-black-80 leading-tight">
                {order.client?.name ?? 'Cliente'}
              </p>
              {order.client?.phone && (
                <a
                  href={`tel:${order.client.phone}`}
                  className="flex items-center gap-1 text-xs text-neutral-black-50 hover:text-primary-red mt-0.5"
                >
                  <Phone size={11} />
                  {order.client.phone}
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', statusColors[order.status] ?? 'bg-neutral-100 text-neutral-600')}>
              {statusLabels[order.status] ?? order.status}
            </span>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="p-1 text-neutral-black-50 hover:text-neutral-black-80"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Comment */}
        {order.comment && (
          <div className="flex items-start gap-1.5 mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-2.5">
            <MessageSquare size={13} className="text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-800 leading-relaxed">{order.comment}</p>
          </div>
        )}
      </div>

      {/* Expandable items */}
      {expanded && (
        <div className="px-4 pb-3 border-t border-neutral-black-10 pt-3 space-y-2">
          <p className="text-[10px] font-bold text-neutral-black-50 uppercase tracking-wide mb-2">Productos</p>
          <ul className="space-y-2">
            {order.orderItems.map((item) => (
              <li key={item.id} className="flex gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-red text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {item.quantity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-black-80 leading-tight truncate">{item.name}</p>
                  {item.complements && item.complements.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.complements.map((c, i) => (
                        <span key={i} className="text-[10px] bg-neutral-black-10 text-neutral-black-50 rounded px-1.5 py-0.5">
                          {c.quantity > 1 ? `${c.quantity}× ` : ''}{c.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.modifications && item.modifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.modifications.map((m, i) => (
                        <span key={i} className="text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-200 rounded px-1.5 py-0.5">
                          {m.icon} {m.text}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-neutral-black-50 shrink-0">{formatCOP(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action button */}
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
