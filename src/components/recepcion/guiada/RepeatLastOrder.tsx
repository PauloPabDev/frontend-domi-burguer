"use client";

import { Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notify } from '@/utils/notify';
import type { WorkerOrder } from '@/types/worker';
import type { NuevaOrdenForm } from './types';

const summarize = (order: WorkerOrder) =>
  order.orderItems.map((oi) => {
    const adds = (oi.complements ?? []).map((c) => c.name).filter(Boolean).join(', ');
    return `${oi.quantity}× ${oi.name ?? 'Producto'}${adds ? ` + ${adds}` : ''}`;
  });

/** "¿Lo de siempre?": repite el último pedido no cancelado del cliente. No se muestra si no hay. */
export function RepeatLastOrder({ form }: { form: NuevaOrdenForm }) {
  const last = form.orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'deleted' && o.orderItems.length > 0)
    .reduce<WorkerOrder | null>((a, o) => (!a || o.createdAt > a.createdAt ? o : a), null);
  if (!last) return null;

  const repeat = () => {
    const skipped = form.addItemsFromOrder(last);
    notify.success('Pedido anterior agregado');
    if (skipped > 0) {
      notify.info(
        skipped === 1 ? 'Un producto ya no está en el menú' : `${skipped} productos ya no están en el menú`,
        'No se agregó a este pedido.',
      );
    }
  };

  return (
    <section aria-labelledby="repetir-titulo" className="flex items-center justify-between gap-3 rounded-xl border border-accent-yellow-40 bg-accent-yellow-10 p-4 shadow-sm">
      <div className="min-w-0">
        <h3 id="repetir-titulo" className="flex items-center gap-1.5 text-sm font-bold text-neutral-black-80">
          <Repeat className="size-4" aria-hidden="true" />
          ¿Lo de siempre?
        </h3>
        <ul className="mt-1 text-sm text-neutral-black-80/70">
          {summarize(last).map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>
      <Button type="button" variant="destructive" onClick={repeat} className="h-11 shrink-0 px-5">
        Repetir
      </Button>
    </section>
  );
}
