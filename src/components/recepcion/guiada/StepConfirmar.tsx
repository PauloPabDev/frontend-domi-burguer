"use client";

import { DeliveryPriceEditor } from './DeliveryPriceEditor';
import { OrderCommentField } from './OrderCommentField';
import { OrderSummaryLines } from './OrderSummaryLines';
import { OrderTotals } from './OrderTotals';
import { PaymentSelector } from './PaymentSelector';
import { SedeSelect } from './SedeSelect';
import { SubmitChecklist } from './SubmitChecklist';
import type { GoToStepProps, StepProps } from './types';

const cardClass = 'rounded-xl border border-neutral-black-20 bg-white p-4 shadow-sm';
const editClass =
  'inline-flex h-11 shrink-0 items-center rounded-lg px-3 text-sm font-semibold text-primary-red-100 hover:bg-neutral-black-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-red-100';

export function StepConfirmar({ form, onGoToStep }: StepProps & GoToStepProps) {
  const location = form.locations.find((l) => l.id === form.selectedLocationId);

  return (
    <div className="flex flex-col gap-4">
      <section aria-label="Entrega" className={cardClass}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-neutral-black-80">Entrega</h3>
            {location ? (
              <>
                <p className="mt-1 text-sm font-semibold text-neutral-black-80">{location.name}</p>
                <p className="text-sm text-neutral-black-80">
                  {location.address}{location.floor ? ` · Piso ${location.floor}` : ''}
                </p>
                {location.comment && <p className="mt-1 text-sm italic text-neutral-black-80/70">“{location.comment}”</p>}
              </>
            ) : (
              <p className="mt-1 text-sm text-neutral-black-80/70">Sin dirección elegida</p>
            )}
          </div>
          <button type="button" onClick={() => onGoToStep(2)} className={editClass}>Cambiar</button>
        </div>
      </section>

      <section aria-label="Pedido" className={`${cardClass} flex flex-col gap-4`}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-bold text-neutral-black-80">Pedido</h3>
          <button type="button" onClick={() => onGoToStep(3)} className={editClass}>Editar pedido</button>
        </div>
        {form.orderItems.length === 0 ? (
          <p className="text-sm text-neutral-black-80/70">Aún no hay productos</p>
        ) : (
          <OrderSummaryLines items={form.orderItems} />
        )}
        <div className="border-t border-neutral-black-20 pt-3">
          <OrderTotals form={form} deliverySlot={form.delivery ? <DeliveryPriceEditor form={form} /> : undefined} />
        </div>
      </section>

      <section className={cardClass}><SedeSelect form={form} /></section>
      <section className={cardClass}><PaymentSelector form={form} /></section>
      <section className={cardClass}><OrderCommentField form={form} /></section>
      <SubmitChecklist form={form} />
    </div>
  );
}
