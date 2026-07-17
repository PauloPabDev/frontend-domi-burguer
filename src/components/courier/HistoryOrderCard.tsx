'use client';

import { MapPin, Package } from 'lucide-react';
import { CourierOrder } from '@/types/courier';
import { OrderNumberChip, OrderClientChip, OrderTimeChip } from '@/components/ui/OrderClientChips';
import { formatCOP } from '@/components/ui/OrderItemsList';
import { formatTime } from '@/lib/dates';
import { PAYMENT_LABELS } from '@/types/worker';

interface HistoryOrderCardProps {
  order: CourierOrder;
}

export function HistoryOrderCard({ order }: HistoryOrderCardProps) {
  const address =
    order.location?.address ?? order.deliveryAddress?.address ?? 'Sin dirección';

  const firstItem = order.orderItems[0];
  const extraCount = order.orderItems.length - 1;
  const productSummary = firstItem
    ? extraCount > 0
      ? `${firstItem.quantity}× ${firstItem.name} y ${extraCount} más`
      : `${firstItem.quantity}× ${firstItem.name}`
    : 'Sin productos';

  return (
    <div className="rounded-2xl border border-neutral-black-20 bg-white shadow-sm overflow-hidden">
      {/* Header: número + cliente + hora */}
      <div className="p-4 flex items-center gap-2">
        <OrderNumberChip orderNumber={order.dailyOrderNumber} />
        <OrderClientChip
          name={order.client?.name}
          phone={order.client?.phone}
          clientId={order.clientId}
        />
        <OrderTimeChip time={formatTime(order.createdAt)} className="ml-auto" />
      </div>

      {/* Dirección + producto */}
      <div className="px-4 pb-3 pt-3 border-t border-neutral-black-10 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-neutral-black-50 shrink-0" />
          <p className="text-xs text-neutral-black-50 line-clamp-1">{address}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Package size={12} className="text-neutral-black-50 shrink-0" />
          <p className="text-xs text-neutral-black-70 line-clamp-1">{productSummary}</p>
        </div>
      </div>

      {/* Footer: ganancias + total + acción */}
      <div className="flex items-center gap-3 px-4 py-3 border-t border-neutral-black-10 bg-neutral-black-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] text-neutral-black-50 uppercase tracking-wide">Domicilio</span>
          <span className="text-sm font-bold text-primary-red">{formatCOP(order.delivery.price || 0)}</span>
        </div>
        <div className="w-px h-8 bg-neutral-black-20 shrink-0" />
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className="text-[10px] text-neutral-black-50 uppercase tracking-wide">Total pedido</span>
          <span className="text-sm font-bold text-neutral-black-80">{formatCOP(order.totalPrice)}</span>
        </div>
        <div className="w-px h-8 bg-neutral-black-20 shrink-0" />
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] text-neutral-black-50 uppercase tracking-wide">Pago</span>
          <span className="text-sm font-bold text-neutral-black-80">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
        </div>
        {/* <Link
          href={`/domiciliario/historial/${order.id}`}
          className="flex items-center gap-1 bg-neutral-black-80 text-white text-xs font-bold px-3.5 py-2 rounded-full hover:bg-neutral-black-100 transition-colors shrink-0"
        >
          Ver más
          <ChevronRight size={13} />
        </Link> */}
      </div>
    </div>
  );
}
