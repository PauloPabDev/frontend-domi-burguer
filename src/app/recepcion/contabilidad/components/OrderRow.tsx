"use client";

import Link from 'next/link';
import { Bike, ChefHat, Clock, CreditCard, ArrowRight } from 'lucide-react';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { PAYMENT_LABELS, WorkerOrder } from '@/types/worker';
import { formatCOP, formatTime } from '../utils';

function NumberBadge({ n }: { n: number | undefined }) {
  return (
    <span className="shrink-0 w-9 h-9 rounded-full bg-primary-red text-white text-sm font-bold flex items-center justify-center">
      {n ?? '?'}
    </span>
  );
}

function MetaChip({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="flex items-center gap-1 text-xs text-neutral-black-50">
      <Icon size={11} />
      {label}
    </span>
  );
}

function ItemsSummary({ items }: { items: WorkerOrder['orderItems'] }) {
  if (!items.length) return null;
  const text = items.map((i) => `${i.quantity ?? 1}× ${i.name ?? '—'}`).join(' · ');
  return <p className="text-xs text-neutral-black-50 truncate mt-1">{text}</p>;
}

export function OrderRow({ order }: { order: WorkerOrder }) {
  const clientName = order.client?.name ?? order.user?.name ?? 'Sin cliente';
  const clientPhone = order.client?.phone ?? order.user?.phone;
  const items = order.orderItems ?? [];

  function storeOrder() {
    sessionStorage.setItem(`order_${order.id}`, JSON.stringify(order));
  }

  return (
    <div className="rounded-2xl border border-neutral-black-20 bg-white p-4 flex flex-col gap-3">
      {/* Client + total + status */}
      <div className="flex items-start gap-3">
        <NumberBadge n={order.dailyOrderNumber} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-neutral-black-80 truncate">{clientName}</p>
          {clientPhone && (
            <p className="text-xs text-neutral-black-50 mt-0.5">{clientPhone}</p>
          )}
          <ItemsSummary items={items} />
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-sm font-bold text-neutral-black-80">
            {formatCOP(order.totalPrice ?? 0)}
          </span>
          <OrderStatusBadge status={order.status} className="text-[10px] px-2 py-0.5" />
        </div>
      </div>

      {/* Meta + link */}
      <div className="flex items-center justify-between gap-2 border-t border-neutral-black-10 pt-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <MetaChip icon={Clock} label={formatTime(order.updatedAt)} />
          <MetaChip
            icon={CreditCard}
            label={PAYMENT_LABELS[order.paymentMethod ?? ''] ?? order.paymentMethod ?? '—'}
          />
          {order.courier?.name && <MetaChip icon={Bike} label={order.courier.name} />}
          {order.kitchen?.name && <MetaChip icon={ChefHat} label={order.kitchen.name} />}
        </div>

        <Link
          href={`/recepcion/contabilidad/pedido/${order.id}`}
          onClick={storeOrder}
          className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary-red hover:underline"
        >
          Ver más <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
