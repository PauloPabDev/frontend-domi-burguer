"use client";

import type { OrderItem } from '@/hooks/recepcion/useNuevaOrden';
import { fmt, lineTotal } from './utils';

/** Líneas del pedido, solo lectura: "2× Combo", adiciones en verde y eliminaciones tachadas. */
export function OrderSummaryLines({ items }: { items: OrderItem[] }) {
  return (
    <ul className="flex flex-col divide-y divide-neutral-black-10">
      {items.map((item) => {
        const additions = item.complements.filter((c) => !c.minusComplement && c.name);
        const removals = item.complements.filter((c) => c.minusComplement && c.name);
        return (
          <li key={item.itemId} className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-black-80">
                {item.quantity}× {item.product.name}
              </p>
              {additions.map((c) => (
                <p key={String(c.id)} className="text-xs text-green-800">
                  + {c.name}{c.quantity > 1 ? ` ×${c.quantity}` : ''}
                </p>
              ))}
              {removals.length > 0 && (
                <p className="text-xs text-neutral-black-80/70 line-through">
                  sin {removals.map((c) => c.name).join(', ')}
                </p>
              )}
            </div>
            <span className="shrink-0 text-sm font-semibold text-neutral-black-80">{fmt(lineTotal(item))}</span>
          </li>
        );
      })}
    </ul>
  );
}
