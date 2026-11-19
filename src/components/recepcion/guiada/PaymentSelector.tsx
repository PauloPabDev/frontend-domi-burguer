"use client";

import { useMemo } from 'react';
import { PAYMENT_METHODS } from '@/hooks/recepcion/useNuevaOrden';
import { cn } from '@/lib/utils';
import type { NuevaOrdenForm } from './types';

/** Método más usado en el historial del cliente (undefined si no hay historial). */
function usualMethod(orders: NuevaOrdenForm['orders']): string | undefined {
  const counts = new Map<string, number>();
  for (const o of orders) counts.set(o.paymentMethod, (counts.get(o.paymentMethod) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

export function PaymentSelector({ form }: { form: NuevaOrdenForm }) {
  const usual = useMemo(() => usualMethod(form.orders), [form.orders]);
  const usualLabel = PAYMENT_METHODS.find((m) => m.id === usual)?.label;
  return (
    <div className="flex flex-col gap-2">
      <p id="payment-label" className="text-sm font-semibold text-neutral-black-80">
        Método de pago
        {usualLabel && <span className="ml-2 font-normal text-neutral-black-80/70">Habitual: {usualLabel}</span>}
      </p>
      <div role="radiogroup" aria-labelledby="payment-label" className="grid grid-cols-3 gap-2">
        {PAYMENT_METHODS.map((m) => {
          const selected = form.paymentMethod === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => form.setPaymentMethod(m.id)}
              className={cn(
                'flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl border-[1.5px] p-1.5 text-sm font-bold text-neutral-black-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-red-100',
                selected ? 'border-primary-red-100 bg-primary-red-100/10 ring-1 ring-inset ring-primary-red-100' : 'border-neutral-black-20 bg-white hover:border-neutral-black-80',
              )}
            >
              {m.label}
              {m.id === usual && <small className="text-xs font-medium text-neutral-black-80/70">habitual</small>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
