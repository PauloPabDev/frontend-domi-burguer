'use client';

import { OrderItem } from '@/types/orders';
import { cn } from '@/lib/utils';

export const formatCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

interface OrderItemsListProps {
  items: OrderItem[];
  /** Muestra círculo de cantidad (estilo cocina). Por defecto muestra "Nx" en texto */
  circleQty?: boolean;
  className?: string;
}

export function OrderItemsList({ items, circleQty = false, className }: OrderItemsListProps) {
  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((item) => (
        <li key={item.id} className=" flex gap-2">
          {/* Cantidad */}
          {circleQty ? (
            <span className="w-6 h-6 rounded-full bg-primary-red text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {item.quantity}
            </span>
          ) : (
            <span className="text-sm font-bold text-primary-red shrink-0 mt-0.5 w-6 text-center">
              {item.quantity}
            </span>
          )}

          {/* Nombre + adicionales */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-neutral-black-80 leading-tight">
                {item.name}
              </p>
              <span className="text-xs text-neutral-black-50 shrink-0">
                {formatCOP(item.price * item.quantity)}
              </span>
            </div>

            {/* Complementos — mismo patrón que OrderTotals */}
            {item.complements && item.complements.length > 0 && (
              <div className="flex flex-col gap-0.5 pl-3 border-l-2 border-neutral-black-20 ml-1 mt-1">
                {item.complements.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-neutral-black-50">
                    <span>+ {c.name}{c.quantity > 1 ? ` x${c.quantity}` : ''}</span>
                    <span>{formatCOP(c.price * (c.quantity || 1))}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Modificaciones */}
            {item.modifications && item.modifications.length > 0 && (
              <div className="flex flex-col gap-0.5 pl-3 border-l-2 border-yellow-300 ml-1 mt-1">
                {item.modifications.map((m, i) => (
                  <span key={i} className="text-xs text-yellow-700">
                    {m.icon} {m.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
