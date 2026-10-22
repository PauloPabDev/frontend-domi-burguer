"use client";

import { OrderItem } from '@/types/orders';
import { formatCOP } from '@/components/ui/OrderItemsList';
import { cn } from '@/lib/utils';

// La cantidad de un complemento es por unidad del producto: 4 combos con 2 papas = 8 papas.
// Se muestra el total y, si el producto tiene más de una unidad, la multiplicación que lo explica.
export function getComplementQuantities(item: OrderItem, complement: OrderItem) {
  const perUnit = complement.quantity || 1;
  return {
    total: perUnit * item.quantity,
    formula: item.quantity > 1 ? `${perUnit}×${item.quantity}` : null,
  };
}

// sm: recepción y domiciliario (columnas angostas) · lg: cocina (se lee de lejos)
const LIST_SIZES = {
  sm: {
    list: 'space-y-1',
    qty: 'min-w-5 h-5 px-1 text-xs',
    name: 'text-[13px] pt-0.5',
    sub: 'pl-6 mt-0.5 space-y-0.5',
    complement: 'gap-1 text-[11px]',
    complementQty: 'min-w-4 h-4 px-0.5 text-[10px]',
    formula: 'text-[10px]',
    notes: 'pl-6 text-[11px]',
  },
  lg: {
    list: 'space-y-2.5',
    qty: 'min-w-7 h-7 px-1.5 text-sm',
    name: 'text-base pt-0.5',
    sub: 'pl-9 mt-1 space-y-1',
    complement: 'gap-1.5 text-sm',
    complementQty: 'min-w-5 h-5 px-1 text-xs',
    formula: 'text-xs',
    notes: 'pl-9 text-sm',
  },
} as const;

interface OrderItemsCompactListProps {
  items: OrderItem[];
  size?: keyof typeof LIST_SIZES;
}

export function OrderItemsCompactList({ items, size = 'sm' }: OrderItemsCompactListProps) {
  const sz = LIST_SIZES[size];
  return (
    <ul className={sz.list}>
      {items.map((item, index) => (
        <li key={index}>
          <div className="flex items-start gap-1.5">
            <span
              className={cn('rounded-full text-white font-bold flex items-center justify-center shrink-0', sz.qty)}
              style={{ backgroundColor: item.colorPrimary ?? 'var(--color-primary-red)' }}
            >
              {item.quantity}
            </span>
            <span className={cn('font-bold text-neutral-black-80 leading-tight line-clamp-2', sz.name)}>
              {item.name}
            </span>
          </div>

          {item.complements && item.complements.length > 0 && (
            <ul className={sz.sub}>
              {item.complements.map((c, i) => {
                const { total, formula } = getComplementQuantities(item, c);
                return (
                  <li key={i} className={cn('flex items-start text-neutral-black-100 leading-tight', sz.complement)}>
                    <span
                      className={cn('rounded-full text-white font-bold flex items-center justify-center shrink-0', sz.complementQty)}
                      style={{ backgroundColor: c.colorPrimary ?? 'var(--color-neutral-black-60)' }}
                    >
                      {total}
                    </span>
                    <span className="pt-px">
                      <span className="font-semibold text-neutral-black-80">{c.name}</span>
                      {c.codes?.length ? ` (${c.codes.join(', ')})` : ''}
                      {formula && <span className={cn('ml-1 text-neutral-black-100', sz.formula)}>({formula})</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {item.notes && (
            <p className={cn('italic text-amber-700 leading-tight line-clamp-2', sz.notes)}>{item.notes}</p>
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

/**
 * Resumen visual del pedido (lista colapsada): un círculo por producto con su cantidad y color,
 * y debajo los complementos como badges pequeños con su cantidad total.
 */
export function OrderItemsSummary({ items, inline = false }: { items: OrderItem[]; inline?: boolean }) {
  // En línea: los productos saltan de renglón si no caben; los complementos van en cadena
  // (badges solapados) justo debajo de su producto, con altura mínima para no estirar la card
  if (inline) {
    return (
      <div className="flex flex-wrap items-start gap-x-1.5 gap-y-1">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center"
            title={[
              `${item.quantity}× ${item.name ?? ''}`,
              ...(item.complements ?? []).map((c) => `  ${getComplementQuantities(item, c).total} ${c.name ?? ''}`),
            ].join('\n')}
          >
            <span
              className="min-w-5 h-5 px-1 rounded-full text-white text-[11px] font-bold flex items-center justify-center"
              style={{ backgroundColor: item.colorPrimary ?? 'var(--color-primary-red)' }}
            >
              {item.quantity}
            </span>
            {item.complements && item.complements.length > 0 && (
              <div className="flex -space-x-1 -mt-0.5">
                {item.complements.map((c, i) => (
                  <span
                    key={i}
                    className="min-w-3 h-3 px-0.5 rounded-full ring-1 ring-white text-white text-[8px] font-bold leading-none flex items-center justify-center"
                    style={{ backgroundColor: c.colorPrimary ?? 'var(--color-neutral-black-60)' }}
                  >
                    {getComplementQuantities(item, c).total}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-start gap-1.5">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center gap-0.5"
          title={[
            `${item.quantity}× ${item.name ?? ''}`,
            ...(item.complements ?? []).map((c) => `  ${getComplementQuantities(item, c).total} ${c.name ?? ''}`),
          ].join('\n')}
        >
          <span
            className="min-w-6 h-6 px-1 rounded-full text-white text-xs font-bold flex items-center justify-center"
            style={{ backgroundColor: item.colorPrimary ?? 'var(--color-primary-red)' }}
          >
            {item.quantity}
          </span>
          {item.complements && item.complements.length > 0 && (
            <div className="flex flex-wrap justify-center gap-0.5 max-w-12">
              {item.complements.map((c, i) => (
                <span
                  key={i}
                  className="min-w-3.5 h-3.5 px-0.5 rounded-full text-white text-[9px] font-bold leading-none flex items-center justify-center"
                  style={{ backgroundColor: c.colorPrimary ?? 'var(--color-neutral-black-60)' }}
                >
                  {getComplementQuantities(item, c).total}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
