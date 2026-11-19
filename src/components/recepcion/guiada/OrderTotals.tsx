"use client";

import type { ReactNode } from 'react';
import { fmt } from './utils';
import type { NuevaOrdenForm } from './types';

interface OrderTotalsProps {
  form: NuevaOrdenForm;
  /** Reemplaza el valor del domicilio (p. ej. por el editor de precio). */
  deliverySlot?: ReactNode;
}

export function OrderTotals({ form, deliverySlot }: OrderTotalsProps) {
  const price = form.delivery?.price;
  return (
    <dl className="grid gap-2 text-sm text-neutral-black-80">
      <div className="flex items-center justify-between gap-2">
        <dt>Subtotal</dt>
        <dd>{fmt(form.subtotal)}</dd>
      </div>
      <div className="flex items-center justify-between gap-2">
        <dt>Domicilio</dt>
        <dd>{deliverySlot ?? (price != null ? fmt(price) : <span className="text-neutral-black-80/70">Sin domicilio</span>)}</dd>
      </div>
      <div className="flex items-center justify-between gap-2 border-t-2 border-neutral-black-80 pt-2.5 text-xl font-extrabold">
        <dt>Total</dt>
        <dd className="text-primary-red-100">{fmt(form.total)}</dd>
      </div>
    </dl>
  );
}
