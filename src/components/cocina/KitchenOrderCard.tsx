"use client";

import { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { WorkerOrder, STATUS_CONFIG } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { OrderStatusStrip } from '@/components/ui/OrderStatusStrip';
import { OrderItemsCompactList } from '@/components/ui/OrderItemsCompactList';
import { OrderElapsedTime } from '@/components/ui/OrderElapsedTime';
import { OrderComment } from '@/components/ui/OrderComment';
import { OrderActionButtons } from '@/components/ui/OrderActionButtons';
import { OrderAddressRow } from '@/components/ui/OrderAddressRow';
import { OrderClientChip, getClientOriginKey, cardOriginColorMap } from '@/components/ui/OrderClientChips';
import { formatTime } from '@/lib/dates';
import { cn } from '@/lib/utils';

interface KitchenOrderCardProps {
  order: WorkerOrder;
  onStatusChange?: (orderId: string, prev: OrderStatus, next: OrderStatus) => Promise<void>;
}

const COOK_TRANSITIONS: Partial<Record<OrderStatus, { next: OrderStatus; label: string; variant: 'primary' | 'dark' }>> = {
  fresh: { next: 'preparing', label: 'Preparar', variant: 'primary' },
  preparing: { next: 'ready_for_pickup', label: 'Listo para despacho', variant: 'dark' },
};

// Misma estructura que recepción y domiciliario, sin precios: cocina solo necesita qué preparar y cuánto lleva.
// 16px laterales, 12px verticales por sección.
// El radio de la card (24px) = radio de los botones (8px) + padding lateral (16px), para que sean concéntricos.
const SECTION = 'border-t border-neutral-black-10 px-4 py-3';

export const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({ order, onStatusChange }) => {
  const [addressOpen, setAddressOpen] = useState(false);

  const transition = COOK_TRANSITIONS[order.status];
  const statusConfig = STATUS_CONFIG[order.status];
  const isUser = !order.clientId && !!order.userId;
  const cardColor = cardOriginColorMap[getClientOriginKey(isUser, order?.origin)];

  return (
    <div
      className={cn(
        'rounded-3xl border shadow-sm overflow-hidden',
        cardColor ?? 'border-neutral-black-20 bg-white'
      )}
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
          <div className="ml-auto flex items-center gap-1.5 shrink-0 text-sm leading-none">
            <span className="font-semibold text-neutral-black-100">{formatTime(order.createdAt)}</span>
            <OrderElapsedTime createdAt={order.createdAt} status={order.status} />
          </div>
        </div>

        {/* Cliente: foto + nombre completo */}
        <OrderClientChip
          name={order.client?.name ?? order.user?.name}
          phone={order.client?.phone ?? order.user?.phone}
          clientId={order.clientId}
          avatarSrc={order.client?.photoURL ?? order.user?.photoURL}
          isUser={isUser}
          origin={order?.origin}
          size="sm"
        />

        {/* Comentario completo: suele traer instrucciones de preparación */}
        {order.comment && <OrderComment comment={order.comment} />}
      </div>

      {/* 2. Pedido (sin precios), tamaño grande para leer de lejos */}
      <div className={SECTION}>
        <OrderItemsCompactList items={order.orderItems} size="lg" />
      </div>

      {/* 3. Dirección colapsable: solo de referencia para cocina */}
      <div className={SECTION}>
        <button
          type="button"
          onClick={() => setAddressOpen((v) => !v)}
          aria-expanded={addressOpen}
          className="w-full flex items-center gap-1.5 text-xs font-semibold text-neutral-black-100 hover:text-neutral-black-80 transition-colors"
        >
          <MapPin size={13} />
          Dirección
          <ChevronDown
            size={14}
            className={cn('ml-auto shrink-0 transition-transform', addressOpen && 'rotate-180')}
          />
        </button>

        {addressOpen && (
          <OrderAddressRow
            location={order.location}
            address={order.deliveryAddress?.address}
            floor={order.deliveryAddress?.floor}
            compact
            className="mt-2"
          />
        )}
      </div>

      {/* 4. Acción */}
      {transition && onStatusChange && (
        <div className={cn(SECTION, 'bg-neutral-black-5/60')}>
          <OrderActionButtons
            label={transition.label}
            variant={transition.variant}
            size="md"
            fullWidth
            buttonClassName="rounded-lg"
            onConfirm={() => onStatusChange(order.id, order.status, transition.next)}
          />
        </div>
      )}
    </div>
  );
};
