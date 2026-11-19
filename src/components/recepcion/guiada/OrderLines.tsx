"use client";

import { Minus, Plus, ShoppingBag, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OrderItem } from '@/hooks/recepcion/useNuevaOrden';
import { ComplementChips } from './ComplementChips';
import type { NuevaOrdenForm } from './types';
import { fmt, lineTotal } from './utils';

/** "+ Tocineta ×2 ($4.000) · sin cebolla" */
function modsText(item: OrderItem): string {
  const adds = item.complements
    .filter((c) => !c.minusComplement && c.name)
    .map((c) => `${c.name}${c.quantity > 1 ? ` ×${c.quantity}` : ''}${c.price ? ` (${fmt(c.price)})` : ''}`);
  const removes = item.complements.filter((c) => c.minusComplement && c.name).map((c) => `sin ${c.name?.toLowerCase()}`);
  return [adds.length ? `+ ${adds.join(', ')}` : '', ...removes].filter(Boolean).join(' · ');
}

const stepBtn =
  'grid size-11 place-items-center rounded-full text-neutral-black-80 hover:bg-neutral-black-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red-100/50';

interface OrderLinesProps {
  form: NuevaOrdenForm;
  openId: number | null;
  onToggle: (itemId: number) => void;
}

export function OrderLines({ form, openId, onToggle }: OrderLinesProps) {
  if (form.orderItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-neutral-black-20 px-4 py-6 text-center">
        <ShoppingBag className="size-6 text-neutral-black-80/70" aria-hidden="true" />
        <p className="text-sm font-bold text-neutral-black-80">El pedido está vacío</p>
        <p className="text-sm text-neutral-black-80/70">Toca un producto para agregarlo.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-2.5">
      {form.orderItems.map((item) => {
        const open = openId === item.itemId;
        const mods = modsText(item);
        const name = item.product.name;
        return (
          <li key={item.itemId} className="grid gap-2 rounded-xl border border-neutral-black-20 bg-white p-3">
            <div className="flex items-baseline justify-between gap-2">
              <b className="text-sm leading-tight text-neutral-black-80">{name}</b>
              <span className="whitespace-nowrap text-sm font-extrabold text-neutral-black-80">{fmt(lineTotal(item))}</span>
            </div>
            {mods && <p className="text-sm text-neutral-black-80/70">{mods}</p>}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {item.product.allowCustomization ? (
                <Button
                  type="button"
                  variant="light-outline"
                  aria-expanded={open}
                  onClick={() => onToggle(item.itemId)}
                  className="h-11 px-4"
                >
                  <SlidersHorizontal className="size-4" aria-hidden="true" />
                  {open ? 'Cerrar' : 'Personalizar'}
                </Button>
              ) : (
                <span />
              )}
              <div className="inline-flex items-center rounded-full border border-neutral-black-20">
                <button
                  type="button"
                  onClick={() => form.changeQuantity(item.itemId, item.quantity - 1)}
                  aria-label={`${item.quantity === 1 ? 'Quitar' : 'Una menos de'} ${name}`}
                  className={stepBtn}
                >
                  {item.quantity === 1 ? <Trash2 className="size-5 text-primary-red-100" aria-hidden="true" /> : <Minus className="size-5" aria-hidden="true" />}
                </button>
                <output aria-live="polite" aria-label={`Cantidad de ${name}`} className="min-w-8 text-center text-sm font-bold tabular-nums">
                  {item.quantity}
                </output>
                <button
                  type="button"
                  onClick={() => form.changeQuantity(item.itemId, item.quantity + 1)}
                  aria-label={`Una más de ${name}`}
                  className={stepBtn}
                >
                  <Plus className="size-5" aria-hidden="true" />
                </button>
              </div>
            </div>
            {open && <ComplementChips item={item} form={form} />}
          </li>
        );
      })}
    </ul>
  );
}
