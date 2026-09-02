'use client';

import { useState } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { OrderStatus } from '@/types/orders';
import { STATUS_CONFIG } from '@/types/worker';
import { cn } from '@/lib/utils';

// Todos los estados que se pueden asignar manualmente. "cancelled" queda fuera:
// una orden se cancela por su propio flujo (eliminar/cancelar orden), no por acá.
const OVERRIDE_STATUSES: OrderStatus[] = [
  'fresh',
  'preparing',
  'ready_for_pickup',
  'dispatched',
  'delivered',
  'pending_payment',
  'invoiced',
];

export interface OrderStatusPickerProps {
  currentStatus: OrderStatus;
  onSelect: (status: OrderStatus) => Promise<void>;
  className?: string;
}

/**
 * Selector de estado sin restricción de flujo: pensado para el panel de admin,
 * donde se puede saltar a cualquier estado (incluido retroceder) para corregir
 * errores operativos. El backend valida que quien llama tenga rol admin.
 */
export function OrderStatusPicker({ currentStatus, onSelect, className }: OrderStatusPickerProps) {
  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePick = (status: OrderStatus) => {
    if (status === currentStatus || loading) return;
    setPending(status);
  };

  const handleConfirm = async () => {
    if (!pending) return;
    setLoading(true);
    try {
      await onSelect(pending);
      setPending(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-1.5">
        {OVERRIDE_STATUSES.map((status) => {
          const cfg = STATUS_CONFIG[status];
          const isCurrent = status === currentStatus;
          const isPending = status === pending;
          return (
            <button
              key={status}
              type="button"
              onClick={() => handlePick(status)}
              disabled={isCurrent || loading}
              className={cn(
                'px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-colors disabled:cursor-default',
                isCurrent && cn(cfg.bg, cfg.color, 'border-transparent'),
                !isCurrent && isPending && cn(cfg.bg, cfg.color, 'border-current'),
                !isCurrent && !isPending &&
                  'border-neutral-black-20 text-neutral-black-50 hover:bg-neutral-black-10 hover:text-neutral-black-80',
              )}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {pending && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <ShieldAlert size={14} className="text-amber-600 shrink-0" />
          <p className="flex-1 text-xs text-amber-800">
            Forzar estado a <span className="font-bold">{STATUS_CONFIG[pending].label}</span>
          </p>
          <button
            type="button"
            onClick={() => setPending(null)}
            disabled={loading}
            className="text-xs font-medium text-neutral-black-100 hover:text-neutral-black-80 disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex items-center gap-1 text-xs font-bold text-white bg-primary-red hover:bg-primary-red-100 rounded-full px-3 py-1.5 transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 size={12} className="animate-spin" />}
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
}
