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

function ColoredPill({
  color,
  children,
  className,
}: {
  color?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('relative flex items-center gap-2 rounded-full px-1.5 py-0.5', className)}>
      <div
        className="absolute inset-0 rounded-full opacity-10"
        style={{ backgroundColor: color ?? 'var(--color-primary-red)' }}
      />
      {children}
    </div>
  );
}

export function OrderItemsList({ items, className, deliveryPrice }: OrderItemsListProps) {
  return (
    <ul className={cn('space-y-2', className)}>
      {items.map((item, index) => (
        <li key={index} className="space-y-1">

          {/* Fila principal: [cantidad + nombre] | precio */}
          <div className="flex items-center gap-2">
            <ColoredPill color={item.colorPrimary} className="flex-1 min-w-0">
              {/* Col 1: cantidad */}
              <span
                className="w-6 h-6 rounded-full text-white text-lg font-bold flex items-center justify-center shrink-0"
                style={{ backgroundColor: item.colorPrimary ?? 'var(--color-primary-red' }}
              >
                {item.quantity}
              </span>
              {/* Col 2: nombre */}
              <span className="text-lg font-bold text-neutral-black-80 leading-tight truncate">
                {item.name}
              </span>
            </ColoredPill>

            {/* Col 3: precio */}
            <span className="text-sm font-medium text-neutral-black-50 shrink-0">
              {formatCOP(item.price * item.quantity)}
            </span>
          </div>

          {/* Complementos */}
          {item.complements && item.complements.length > 0 && (
            <div className="flex flex-col gap-1 pl-4">
              {item.complements.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <ColoredPill color={c.colorPrimary} className="flex-1 min-w-0">
                    {/* Col 1: cantidad complemento */}
                    <span
                      className="w-5 h-5 rounded-full text-white text-base font-bold flex items-center justify-center shrink-0"
                      style={{ backgroundColor: c.colorPrimary ?? 'var(--color-neutral-black-30)' }}
                    >
                      {c.quantity}
                    </span>
                    {/* Col 2: nombre complemento */}
                    <span className="text-base font-bold text-neutral-black-50 truncate ">{c.name}</span>
                  </ColoredPill>
                  {/* Col 3: precio complemento */}
                  <span className="text-xs text-neutral-black-50 shrink-0">
                    {formatCOP(c.price * (c.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </li>
      ))}

      {deliveryPrice !== undefined && (
        <li className="flex items-center gap-2 pt-2 border-t border-neutral-black-20">
          <span className="flex-1 text-sm font-semibold text-neutral-black-80">Domicilio</span>
          <span className="text-xs text-neutral-black-50 shrink-0">{formatCOP(deliveryPrice)}</span>
        </li>
      )}
    </ul>
  );
}
