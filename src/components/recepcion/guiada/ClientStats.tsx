"use client";

import { PAYMENT_LABELS, type WorkerOrder } from '@/types/worker';
import { formatNoteDate } from '@/components/notes/noteKinds';
import { fmt } from './utils';

/** La API de pedidos del cliente devuelve como máximo esta cantidad (ORDERS_HISTORY_LIMIT del hook). */
const HISTORY_LIMIT = 15;

const isCancelled = (o: WorkerOrder) => o.status === 'cancelled' || o.status === 'deleted';

/** El valor (texto) más repetido, con su cantidad; undefined si no hay datos. */
function topBy<T>(items: T[], key: (i: T) => string | undefined, weight: (i: T) => number = () => 1) {
  const counts = new Map<string, number>();
  items.forEach((i) => {
    const k = key(i);
    if (k) counts.set(k, (counts.get(k) ?? 0) + weight(i));
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg bg-neutral-black-3 p-3">
      <dt className="text-xs font-semibold text-neutral-black-80/70">{label}</dt>
      <dd className="mt-0.5 truncate text-lg font-bold text-neutral-black-80">{value}</dd>
      <dd className="text-xs text-neutral-black-80/70">{hint}</dd>
    </div>
  );
}

/** Estadísticas honestas: salen solo de los últimos pedidos que trae la API. `orders` viene del más reciente al más antiguo. */
export function ClientStats({ orders }: { orders: WorkerOrder[] }) {
  const valid = orders.filter((o) => !isCancelled(o));
  const delivered = orders.filter((o) => o.status === 'delivered' || o.status === 'invoiced');
  const avg = delivered.length
    ? delivered.reduce((s, o) => s + o.totalPrice - (o.deliveryPrice ?? 0), 0) / delivered.length
    : null;
  const fav = topBy(valid.flatMap((o) => o.orderItems), (i) => i.name, (i) => i.quantity);
  const pay = topBy(valid, (o) => o.paymentMethod);
  const atLimit = orders.length >= HISTORY_LIMIT;

  return (
    <>
      <dl className="grid grid-cols-2 gap-2">
      <Stat label="Últimos pedidos" value={atLimit ? `${HISTORY_LIMIT}+` : String(orders.length)} hint={atLimit ? 'se muestran los más recientes' : 'en total'} />
      <Stat label="Ticket promedio" value={avg === null ? '—' : fmt(avg)} hint={avg === null ? 'sin pedidos entregados' : `${delivered.length} entregados, sin domicilio`} />
      <Stat label="Último pedido" value={formatNoteDate(orders[0].createdAt) || '—'} hint={`#${orders[0].dailyOrderNumber}`} />
      <Stat label="Suele pedir" value={fav?.[0] ?? '—'} hint={fav ? `${fav[1]} unidades en estos pedidos` : 'sin datos'} />
      </dl>
      <p className="text-sm text-neutral-black-80">
        Método de pago habitual: <b>{pay ? (PAYMENT_LABELS[pay[0]] ?? pay[0]) : '—'}</b>
      </p>
    </>
  );
}
