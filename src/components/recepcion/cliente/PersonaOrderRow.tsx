"use client";

import { WorkerOrder, PAYMENT_LABELS } from '@/types/worker';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { OrderAddressRow } from '@/components/ui/OrderAddressRow';
import { formatCOP } from '@/components/ui/OrderItemsList';
import { formatDateTime } from '@/lib/dates';

interface PersonaOrderRowProps {
  order: WorkerOrder;
}

export function PersonaOrderRow({ order }: PersonaOrderRowProps) {
  return (
    <div className="rounded-xl border border-neutral-black-20 bg-white p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold bg-neutral-black-80 text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0">
            {order.dailyOrderNumber}
          </span>
          <span className="text-xs text-neutral-black-50 truncate">{formatDateTime(order.createdAt)}</span>
        </div>
        <OrderStatusBadge status={order.status} className="text-[10px] px-2 py-1 shrink-0" />
      </div>

      <OrderAddressRow
        location={order.location}
        address={order.deliveryAddress?.address}
        floor={order.deliveryAddress?.floor}
        compact
      />

      <div className="flex items-center justify-between border-t border-neutral-black-10 pt-2 text-xs">
        <span className="text-neutral-black-50">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
        <span className="font-bold text-neutral-black-80">{formatCOP(order.totalPrice)}</span>
      </div>
    </div>
  );
}
