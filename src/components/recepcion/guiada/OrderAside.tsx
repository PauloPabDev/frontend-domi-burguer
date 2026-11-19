"use client";

import { OrderSummaryLines } from './OrderSummaryLines';
import { OrderTotals } from './OrderTotals';
import { countUnits } from './utils';
import type { NuevaOrdenForm } from './types';

/** Ticket lateral de solo lectura para los pasos 1-3 en escritorio. */
export function OrderAside({ form }: { form: NuevaOrdenForm }) {
  const units = countUnits(form.orderItems);
  return (
    <aside
      aria-label="Resumen del pedido"
      className="flex flex-col gap-4 rounded-xl border border-neutral-black-20 bg-white p-4 shadow-sm lg:sticky lg:top-[112px]"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-base font-bold text-neutral-black-80">Pedido</h2>
        {units > 0 && (
          <span className="text-sm text-neutral-black-80/70">{units} {units === 1 ? 'unidad' : 'unidades'}</span>
        )}
      </div>
      {units === 0 ? (
        <p className="text-sm text-neutral-black-80/70">Aún no hay productos</p>
      ) : (
        <OrderSummaryLines items={form.orderItems} />
      )}
      <div className="border-t border-neutral-black-20 pt-3">
        <OrderTotals form={form} />
      </div>
    </aside>
  );
}
