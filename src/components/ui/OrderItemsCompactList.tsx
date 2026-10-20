"use client";

import { OrderItem } from '@/types/orders';
import { formatCOP } from '@/components/ui/OrderItemsList';
import { cn } from '@/lib/utils';

// La cantidad de un complemento es por unidad del producto: 4 combos con 2 papas = 8 papas.
// Se muestra el total y, si el producto tiene más de una unidad, la multiplicación que lo explica.
function getComplementQuantities(item: OrderItem, complement: OrderItem) {
  const perUnit = complement.quantity || 1;
  return {
    total: perUnit * item.quantity,
    formula: item.quantity > 1 ? `${perUnit}×${item.quantity}` : null,
  };
}

export function OrderItemsCompactList({ items }: { items: OrderItem[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item, index) => (
        <li key={index}>
          <div className="flex items-start gap-1.5">
            <span
              className="min-w-5 h-5 px-1 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
              style={{ backgroundColor: item.colorPrimary ?? 'var(--color-primary-red)' }}
            >
              {item.quantity}
            </span>
            <span className="text-[13px] font-bold text-neutral-black-80 leading-tight pt-0.5 line-clamp-2">
              {item.name}
            </span>
          </div>

          {item.complements && item.complements.length > 0 && (
            <ul className="pl-6 mt-0.5 space-y-0.5">
              {item.complements.map((c, i) => {
                const { total, formula } = getComplementQuantities(item, c);
                return (
                  <li key={i} className="flex items-start gap-1 text-[11px] text-neutral-black-100 leading-tight">
                    <span
                      className="min-w-4 h-4 px-0.5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                      style={{ backgroundColor: c.colorPrimary ?? 'var(--color-neutral-black-60)' }}
                    >
                      {total}
                    </span>
                    <span className="pt-px">
                      <span className="font-semibold text-neutral-black-80">{c.name}</span>
                      {c.codes?.length ? ` (${c.codes.join(', ')})` : ''}
                      {formula && <span className="ml-1 text-[10px] text-neutral-black-100">({formula})</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {item.notes && (
            <p className="pl-6 text-[11px] italic text-amber-700 leading-tight line-clamp-2">{item.notes}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

function PriceRow({ label, value, muted = false }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className={cn('flex items-start justify-between gap-2', muted ? 'text-neutral-black-100' : 'text-neutral-black-80')}>
      <span className="min-w-0 leading-tight">{label}</span>
      <span className="shrink-0 tabular-nums">{formatCOP(value)}</span>
    </div>
  );
}

export function OrderPriceBreakdown({ items, deliveryPrice }: { items: OrderItem[]; deliveryPrice: number }) {
  return (
    <div className="space-y-0.5 text-[11px] pt-1">
      {items.map((item, index) => (
        <div key={index} className="space-y-0.5">
          <PriceRow label={`${item.quantity}× ${item.name ?? ''}`} value={item.price * item.quantity} />
          {item.complements?.map((c, i) => {
            const { total, formula } = getComplementQuantities(item, c);
            return (
              <div key={i} className="pl-3">
                <PriceRow
                  label={`${total} ${c.name ?? ''}${formula ? ` (${formula})` : ''}`}
                  value={c.price * total}
                  muted
                />
              </div>
            );
          })}
        </div>
      ))}
      {deliveryPrice > 0 && (
        <div className="pt-0.5 mt-0.5 border-t border-neutral-black-10">
          <PriceRow label="Domicilio" value={deliveryPrice} />
        </div>
      )}
    </div>
  );
}
