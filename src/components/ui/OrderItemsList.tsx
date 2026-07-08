'use client';

import { OrderItem } from '@/types/orders';
import { cn } from '@/lib/utils';

export const formatCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

interface OrderItemsListProps {
  items: OrderItem[];
  className?: string;
  deliveryPrice?: number;
}

export function OrderItemsList({ items, className, deliveryPrice }: OrderItemsListProps) {
  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-2">
          {/* Cantidad */}
          <span
            className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
            style={{ backgroundColor: item.colorPrimary ?? 'var(--color-primary-red)' }}
          >
            {item.quantity}
          </span>

          {/* Nombre + adicionales */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-neutral-black-80 leading-tight">
                {item.name}
              </p>
              <span className="text-xs text-neutral-black-50 shrink-0">
                {formatCOP(item.price * item.quantity)}
              </span>
            </div>

            {/* Complementos */}
            {item.complements && item.complements.length > 0 && (
              <div className="flex flex-col gap-1 ml-1 mt-1">
                {item.complements.map((c, i) => {
                  console.log('complement', c);
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                        style={{ backgroundColor: c.colorPrimary ?? 'var(--color-neutral-black-30)' }}
                      >
                        {c.quantity} +
                      </span>
                      <div className="flex-1 flex items-center justify-between text-xs text-neutral-black-50">
                        <span>{c.name}</span>
                        <span className="shrink-0">{formatCOP(c.price * (c.quantity || 1))}</span>
                      </div>
                    </div>
                  )
                })}
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

      {deliveryPrice !== undefined && (
        <li className="flex gap-2 pt-2 border-t border-neutral-black-20">
          <span className="w-6 shrink-0" />
          <div className="flex-1 flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-black-80">Domicilio</p>
            <span className="text-xs text-neutral-black-50">{formatCOP(deliveryPrice)}</span>
          </div>
        </li>
      )}
    </ul>
  );
}
