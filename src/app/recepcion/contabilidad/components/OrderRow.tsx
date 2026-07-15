"use client";

import { useState } from 'react';
import { Bike, ChefHat, Clock, CreditCard } from 'lucide-react';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { PAYMENT_LABELS, WorkerOrder } from '@/types/worker';
import { formatCOP, formatTime } from '../utils';

export function OrderRow({ order }: { order: WorkerOrder }) {
  const [expanded, setExpanded] = useState(false);
  const clientName = order.client?.name ?? order.user?.name ?? 'Sin cliente';
  const clientPhone = order.client?.phone ?? order.user?.phone;
  const itemsSummary = (order.orderItems ?? [])
    .map((i) => `${i.quantity ?? 1}x ${i.name ?? ''}`)
    .join(', ');

  return (
    <div className="rounded-2xl border border-neutral-black-20 bg-white overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-4 hover:bg-neutral-black-3 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="shrink-0 w-8 h-8 rounded-full bg-primary-red text-white text-sm font-bold flex items-center justify-center mt-0.5">
              {order.dailyOrderNumber ?? '?'}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-neutral-black-80 truncate">{clientName}</p>
              {clientPhone && (
                <p className="text-xs text-neutral-black-50 mt-0.5">{clientPhone}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-sm font-bold text-neutral-black-80">{formatCOP(order.totalPrice ?? 0)}</span>
            <OrderStatusBadge status={order.status} className="text-[10px] px-2 py-0.5" />
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-black-50">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatTime(order.updatedAt)}
          </span>
          <span className="flex items-center gap-1">
            <CreditCard size={11} />
            {PAYMENT_LABELS[order.paymentMethod ?? ''] ?? order.paymentMethod ?? '—'}
          </span>
          {order.courier?.name && (
            <span className="flex items-center gap-1">
              <Bike size={11} />
              {order.courier.name}
            </span>
          )}
          {order.kitchen?.name && (
            <span className="flex items-center gap-1">
              <ChefHat size={11} />
              {order.kitchen.name}
            </span>
          )}
        </div>

        <p className="mt-1.5 text-xs text-neutral-black-50 truncate">{itemsSummary}</p>
      </button>

      {expanded && (
        <div className="border-t border-neutral-black-10 px-4 py-3 space-y-2">
          {(order.orderItems ?? []).map((item, idx) => (
            <div key={idx} className="text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-neutral-black-80">
                  {item.quantity ?? 1}× {item.name ?? '—'}
                </span>
                <span className="text-neutral-black-50">
                  {formatCOP((item.price ?? 0) * (item.quantity ?? 1))}
                </span>
              </div>
              {item.complements && item.complements.length > 0 && (
                <ul className="mt-0.5 pl-4 text-xs text-neutral-black-50 space-y-0.5">
                  {item.complements.map((c, ci) => (
                    <li key={ci}>
                      {c.quantity ?? 1}× {c.name ?? '—'}
                      {(c.price ?? 0) > 0 && ` (+${formatCOP((c.price ?? 0) * (c.quantity ?? 1))})`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {(order.deliveryPrice ?? 0) > 0 && (
            <div className="flex justify-between text-sm border-t border-neutral-black-10 pt-2">
              <span className="text-neutral-black-50">Domicilio</span>
              <span className="text-neutral-black-50">{formatCOP(order.deliveryPrice ?? 0)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold border-t border-neutral-black-10 pt-2">
            <span>Total</span>
            <span>{formatCOP(order.totalPrice ?? 0)}</span>
          </div>
          {order.comment && (
            <p className="text-xs text-neutral-black-50 italic border-t border-neutral-black-10 pt-2">
              {order.comment}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
