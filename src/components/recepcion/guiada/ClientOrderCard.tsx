"use client";

import { Clock, Quote, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { formatCOP } from '@/components/ui/OrderItemsList';
import { formatNoteDate } from '@/components/notes/noteKinds';
import { notify } from '@/utils/notify';
import { PAYMENT_LABELS, type WorkerOrder } from '@/types/worker';
import type { NuevaOrdenForm } from './types';

/** Tarjeta de un pedido anterior con el botón "Repetir" (agrega sus productos al pedido actual). */
export function ClientOrderCard({ order, form }: { order: WorkerOrder; form: NuevaOrdenForm }) {
  const place = order.deliveryAddress?.name ?? order.location?.name;
  const address = order.deliveryAddress?.address ?? order.location?.address;
  const cancelled = order.status === 'cancelled' || order.status === 'deleted';

  const handleRepeat = () => {
    const total = order.orderItems.length;
    const skipped = form.addItemsFromOrder(order);
    if (skipped >= total) {
      notify.error('No se pudo repetir', 'Ningún producto de ese pedido sigue en el menú.');
      return;
    }
    notify.success(`Pedido #${order.dailyOrderNumber} agregado`, 'Revisa los productos en el paso Pedido.');
    if (skipped > 0) {
      notify.info('Algunos productos no se agregaron', `${skipped} ya no están en el menú.`);
    }
  };

  return (
    <article className="flex flex-col gap-2 rounded-xl border border-neutral-black-20 bg-white p-4 shadow-sm">
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-neutral-black-80">#{order.dailyOrderNumber}</p>
          <p className="flex items-center gap-1 text-xs text-neutral-black-80/70">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            {formatNoteDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} className="shrink-0 px-2 py-1 text-xs" />
      </header>

      {(place || address) && (
        <p className="text-sm text-neutral-black-80">
          {place && <b>{place}</b>}
          {place && address && ' · '}
          {address}
        </p>
      )}

      <ul className="flex flex-col gap-0.5 text-sm text-neutral-black-80">
        {order.orderItems.map((item, i) => (
          <li key={`${item.id}-${i}`}>
            {item.quantity}× {item.name}
            {item.complements && item.complements.length > 0 && (
              <span className="block text-xs italic text-neutral-black-80/70">
                {item.complements.map((c) => `+ ${c.name}`).join(', ')}
              </span>
            )}
          </li>
        ))}
      </ul>

      {order.comment && (
        <blockquote className="flex items-start gap-1.5 rounded-lg border border-yellow-200 bg-yellow-50 p-2 text-sm text-yellow-900">
          <Quote className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {order.comment}
        </blockquote>
      )}

      <footer className="flex items-center justify-between gap-2 border-t border-neutral-black-10 pt-2">
        <p className="text-sm text-neutral-black-80">
          {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod} · <b>{formatCOP(order.totalPrice)}</b>
        </p>
        {!cancelled && (
          <Button type="button" variant="yellow" onClick={handleRepeat} leftIcon={<Repeat className="size-4" aria-hidden="true" />} className="h-11 shrink-0">
            Repetir
          </Button>
        )}
      </footer>
    </article>
  );
}
