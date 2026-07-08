"use client";

import Link from 'next/link';
import { use, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useCourierOrderDetail } from '@/hooks/courier/useCourierOrderDetail';
import { useEnrichedOrders } from '@/hooks/useEnrichedOrders';
import { OrderNumberChip, OrderClientChip, OrderTimeChip } from '@/components/ui/OrderClientChips';
import { OrderAddressRow } from '@/components/ui/OrderAddressRow';
import { OrderItemsList, formatCOP } from '@/components/ui/OrderItemsList';
import { OrderPaymentRow } from '@/components/ui/OrderPaymentRow';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/dates';

interface PageProps {
  params: Promise<{ id: string }>;
}

const SECTION = 'border-t border-neutral-black-10 p-4';

export default function CourierOrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { order: rawOrder, loading, error } = useCourierOrderDetail(id);

  const rawOrders = useMemo(() => (rawOrder ? [rawOrder] : []), [rawOrder]);
  const enriched = useEnrichedOrders(rawOrders);
  const order = enriched[0] ?? null;

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-neutral-black-50">
        <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Cargando pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-neutral-black-50">
        <p className="text-sm text-red-500">{error ?? 'Pedido no encontrado'}</p>
        <Link href="/domiciliario/historial">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Volver al historial
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto py-4 pb-8 space-y-4">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Link
          href="/domiciliario/historial"
          className="p-2 rounded-full hover:bg-neutral-black-10 transition-colors"
        >
          <ArrowLeft size={18} className="text-neutral-black-80" />
        </Link>
        <h1 className="font-bold text-neutral-black-80">Detalle del pedido</h1>
      </div>

      {/* Order card */}
      <div className="rounded-2xl border border-neutral-black-20 bg-white shadow-sm overflow-hidden">
        {/* Encabezado */}
        <div className="p-4 flex items-center gap-2">
          <OrderNumberChip orderNumber={order.dailyOrderNumber} />
          <OrderClientChip
            name={order.client?.name}
            phone={order.client?.phone}
            clientId={order.clientId}
          />
          <OrderTimeChip time={formatTime(order.updatedAt)} className="ml-auto" />
        </div>

        {/* Dirección */}
        <div className={SECTION}>
          <OrderAddressRow
            location={order.location}
            address={order.deliveryAddress?.address}
            floor={order.deliveryAddress?.floor}
          />
        </div>

        {/* Productos */}
        <div className={SECTION}>
          <OrderItemsList items={order.orderItems} deliveryPrice={order.deliveryPrice} />
          {order.comment && (
            <p className="mt-2 text-xs text-neutral-black-50 italic border-l-2 border-neutral-black-20 pl-2">
              {order.comment}
            </p>
          )}
        </div>

        {/* Pago */}
        <div className={SECTION}>
          <OrderPaymentRow
            paymentMethod={order.paymentMethod}
            total={order.totalPrice}
            paid={order.payment?.status === 'approved'}
          />
        </div>

        {/* Estado + ganancia */}
        <div className={`${SECTION} flex items-center justify-between gap-3`}>
          <OrderStatusBadge status={order.status} />
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] text-neutral-black-50 uppercase tracking-wide">Tu ganancia</span>
            <span className="text-base font-bold text-primary-red">{formatCOP(order.deliveryPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
