"use client";

import { useState } from 'react';
import { ChevronDown, Navigation, Phone } from 'lucide-react';
import { CourierOrder } from '@/types/courier';
import { OrderStatus } from '@/types/orders';
import { STATUS_CONFIG } from '@/types/worker';
import { OrderStatusStrip } from '@/components/ui/OrderStatusStrip';
import { formatCOP } from '@/components/ui/OrderItemsList';
import { OrderItemsCompactList, OrderPriceBreakdown } from '@/components/ui/OrderItemsCompactList';
import { OrderElapsedTime } from '@/components/ui/OrderElapsedTime';
import { OrderAddressRow } from '@/components/ui/OrderAddressRow';
import { OrderComment } from '@/components/ui/OrderComment';
import { OrderActionButtons } from '@/components/ui/OrderActionButtons';
import { OrderClientChip, getClientOriginKey, cardOriginColorMap } from '@/components/ui/OrderClientChips';
import { OrderPaymentRow } from '@/components/ui/OrderPaymentRow';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/dates';

interface CourierOrderCardProps {
  order: CourierOrder;
  isSelected?: boolean;
  onSelect?: () => void;
  onStatusChange?: (orderId: string, prev: OrderStatus, next: OrderStatus) => Promise<void>;
}

const STATUS_TRANSITIONS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  ready_for_pickup: { next: 'dispatched', label: 'Iniciar entrega' },
  dispatched: { next: 'delivered', label: 'Marcar entregado' },
};

// Misma estructura que la card de recepción, con más aire para uso en celular:
// 16px laterales, 12px verticales por sección.
// El radio de la card (24px) = radio de los botones (8px) + padding lateral (16px), para que sean concéntricos.
const SECTION = 'border-t border-neutral-black-10 px-4 py-3';

function getNavigationUrl(order: CourierOrder) {
  const coords = order.location?.coordinates;
  if (coords?.lat != null && coords?.lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
  }
  const address = order.location?.address ?? order.deliveryAddress?.address;
  return address ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}` : null;
}

export const CourierOrderCard: React.FC<CourierOrderCardProps> = ({
  order,
  isSelected,
  onSelect,
  onStatusChange,
}) => {
  const [showPrices, setShowPrices] = useState(false);

  const transition = STATUS_TRANSITIONS[order.status];
  const statusConfig = STATUS_CONFIG[order.status];
  const isUser = !order.clientId && !!order.userId;
  const cardColor = cardOriginColorMap[getClientOriginKey(isUser, order?.origin)];
  const phone = order.client?.phone ?? order.user?.phone;
  const paid = order.payment?.status === 'approved';
  const itemCount = order.orderItems.reduce((acc, item) => acc + item.quantity, 0);
  const navigationUrl = getNavigationUrl(order);

  // La card es seleccionable: los controles internos no deben cambiar la selección
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className={cn(
        'rounded-3xl border shadow-sm transition-all duration-200 overflow-hidden',
        cardColor ?? 'bg-white',
        isSelected ? 'border-primary-red ring-2 ring-primary-red/20' : !cardColor && 'border-neutral-black-20',
      )}
      onClick={onSelect}
    >
      <OrderStatusStrip status={order.status} className="h-1" />

      <div className="px-4 py-3 space-y-2.5">
        {/* 1. Identificación: número · estado · hora · tiempo transcurrido */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 min-w-8 h-8 px-2 flex items-center justify-center bg-primary-red rounded-full text-base font-bold text-white">
            {order.dailyOrderNumber}
          </span>
          {statusConfig && (
            <span className={cn('text-xs font-semibold truncate', statusConfig.color)}>{statusConfig.label}</span>
          )}
          <div className="ml-auto flex items-center gap-1.5 shrink-0 text-xs leading-none">
            <span className="font-semibold text-neutral-black-100">{formatTime(order.createdAt)}</span>
            <OrderElapsedTime createdAt={order.createdAt} status={order.status} />
          </div>
        </div>

        {/* Cliente: foto + nombre completo + llamar */}
        <div className="flex items-center gap-2" onClick={stop}>
          <div className="flex-1 min-w-0">
            <OrderClientChip
              name={order.client?.name ?? order.user?.name}
              phone={phone}
              clientId={order.clientId}
              avatarSrc={order.clientId ? order.client?.photoURL : order.user?.photoURL}
              isUser={isUser}
              origin={order?.origin}
              size="sm"
            />
          </div>
          {phone && (
            <a
              href={`tel:${phone}`}
              aria-label="Llamar al cliente"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors shrink-0"
            >
              <Phone size={16} />
            </a>
          )}
        </div>

        {/* 2. Entrega: dirección + cómo llegar + comentario */}
        <div className="space-y-1.5" onClick={stop}>
          <OrderAddressRow
            location={order.location}
            address={order.deliveryAddress?.address}
            floor={order.deliveryAddress?.floor}
            compact
          />
          {navigationUrl && (
            <a
              href={navigationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-white py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Navigation size={15} />
              Cómo llegar
            </a>
          )}
          {order.comment && <OrderComment comment={order.comment} compact />}
        </div>
      </div>

      {/* 3. Pedido (sin precios) */}
      <div className={SECTION}>
        <OrderItemsCompactList items={order.orderItems} />
      </div>

      {/* 4. Total a cobrar con desglose en acordeón */}
      <div className={SECTION}>
        <button
          type="button"
          onClick={(e) => { stop(e); setShowPrices((prev) => !prev); }}
          aria-expanded={showPrices}
          className="w-full flex items-center gap-1 text-left"
        >
          <span className="text-xs text-neutral-black-100">
            {paid ? 'Pagado' : 'Cobrar'} · {itemCount} prod.
          </span>
          <span
            className={cn(
              'ml-auto text-base font-bold tabular-nums',
              paid ? 'text-green-600' : 'text-neutral-black-80'
            )}
          >
            {formatCOP(order.totalPrice)}
          </span>
          <ChevronDown
            size={16}
            className={cn('text-neutral-black-100 shrink-0 transition-transform', showPrices && 'rotate-180')}
          />
        </button>
        {showPrices && <OrderPriceBreakdown items={order.orderItems} deliveryPrice={order.deliveryPrice} />}
      </div>

      {/* 5. Acciones: pago · siguiente paso (una por fila) */}
      <div className={cn(SECTION, 'bg-neutral-black-5/60 space-y-2')} onClick={stop}>
        <OrderPaymentRow
          paymentMethod={order.paymentMethod}
          total={order.totalPrice}
          paid={paid}
          compact
        />

        {transition && onStatusChange && (
          <OrderActionButtons
            label={transition.label}
            variant={transition.next === 'delivered' ? 'dark' : 'primary'}
            size="md"
            fullWidth
            buttonClassName="rounded-lg"
            onConfirm={() => onStatusChange(order.id, order.status, transition.next)}
            stopPropagation
          />
        )}
      </div>
    </div>
  );
};
