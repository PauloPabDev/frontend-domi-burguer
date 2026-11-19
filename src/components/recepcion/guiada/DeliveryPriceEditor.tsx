"use client";

import { useId, useState } from 'react';
import { Pencil, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { fmt } from './utils';
import type { NuevaOrdenForm } from './types';

const CHIP = 'inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-neutral-black-20 bg-white px-4 text-sm font-semibold text-neutral-black-80 hover:bg-neutral-black-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red/50';

/** Domicilio calculado con ajuste de precio. Lo usan el paso 2 y el paso 4. */
export function DeliveryPriceEditor({ form }: { form: NuevaOrdenForm }) {
  const { delivery, originalDeliveryPrice, overrideDeliveryPrice, resetDeliveryPrice } = form;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const errorId = useId();

  if (!delivery) {
    return (
      <div className="rounded-xl border border-neutral-black-20 bg-white p-4">
        <span className="inline-flex rounded-full bg-accent-yellow-40 px-3 py-1 text-sm font-semibold text-neutral-black-80">
          Elige una dirección
        </span>
      </div>
    );
  }

  const apply = () => {
    const digits = draft.replace(/[\s.$]/g, '');
    if (!/^\d+$/.test(digits)) {
      setError('Escribe un valor entero de 0 en adelante');
      return;
    }
    overrideDeliveryPrice(Number(digits));
    setDraft('');
    setError(null);
  };

  const km = (delivery.distance / 1000).toLocaleString('es-CO', { maximumFractionDigits: 1 });
  const minutes = delivery.duration ? ` · ~${Math.max(1, Math.round(delivery.duration / 60))} min` : '';

  return (
    <div className={cn('grid gap-3 rounded-xl border-[1.5px] p-3', delivery.modified ? 'border-accent-yellow-100 bg-accent-yellow-10' : 'border-neutral-black-20 bg-white')}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-neutral-black-80/70">{km} km{minutes}</p>
          <p aria-live="polite" className="flex flex-wrap items-center gap-2 text-2xl font-bold text-neutral-black-80">
            {fmt(delivery.price)}
            {delivery.modified && originalDeliveryPrice !== null && (
              <span className="rounded-full bg-accent-yellow-60 px-2.5 py-0.5 text-xs font-semibold">
                Modificado · antes {fmt(originalDeliveryPrice)}
              </span>
            )}
          </p>
        </div>
        <Button
          type="button"
          variant="light-outline"
          className="h-11"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          leftIcon={<Pencil />}
        >
          {open ? 'Cerrar' : 'Cambiar precio'}
        </Button>
      </div>

      {open && (
        <div className="grid gap-3 border-t border-dashed border-neutral-black-20 pt-3">
          <div role="group" aria-label="Ajustes rápidos del domicilio" className="flex flex-wrap gap-2">
            <button type="button" className={CHIP} onClick={() => overrideDeliveryPrice(0)}>Gratis</button>
            <button type="button" className={CHIP} onClick={() => overrideDeliveryPrice(Math.max(0, delivery.price - 1000))}>− $1.000</button>
            <button type="button" className={CHIP} onClick={() => overrideDeliveryPrice(delivery.price + 1000)}>+ $1.000</button>
            {delivery.modified && originalDeliveryPrice !== null && (
              <button type="button" className={CHIP} onClick={resetDeliveryPrice}>
                <RotateCcw className="size-4" aria-hidden="true" />
                Restaurar {fmt(originalDeliveryPrice)}
              </button>
            )}
          </div>
          <div>
            <label htmlFor={inputId} className="sr-only">Otro valor del domicilio</label>
            <div className="flex gap-2">
              <input
                id={inputId}
                type="text"
                inputMode="numeric"
                placeholder="Otro valor, ej. 7000"
                value={draft}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                onChange={(e) => { setDraft(e.target.value); setError(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); apply(); } }}
                className="h-11 min-w-0 flex-1 rounded-full border-[1.5px] border-[#cccccc] bg-white px-4 text-base focus-visible:border-neutral-black-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red/50"
              />
              <Button type="button" className="h-11" onClick={apply}>Aplicar</Button>
            </div>
            {error && <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-primary-red-100">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
