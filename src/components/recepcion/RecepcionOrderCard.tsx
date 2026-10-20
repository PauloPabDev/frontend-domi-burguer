"use client";

import { useRef, useState } from 'react';
import { Bike, ChefHat, ChevronDown } from 'lucide-react';
import { WorkerOrder, WorkerKitchen } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { OrderStatusStrip } from '@/components/ui/OrderStatusStrip';
import { formatCOP } from '@/components/ui/OrderItemsList';
import { OrderPaymentRow } from '@/components/ui/OrderPaymentRow';
import { OrderActionButtons } from '@/components/ui/OrderActionButtons';
import { OrderAddressRow } from '@/components/ui/OrderAddressRow';
import { OrderComment } from '@/components/ui/OrderComment';
import { OrderItemsCompactList, OrderPriceBreakdown } from '@/components/ui/OrderItemsCompactList';
import { OrderElapsedTime } from '@/components/ui/OrderElapsedTime';
import { OrderClientChip, getClientOriginKey, cardOriginColorMap } from '@/components/ui/OrderClientChips';
import { OrderNumberMenu } from './OrderNumberMenu';
import { AssignCourierPopover } from './AssignCourierPopover';
import { AssignKitchenModal } from './AssignKitchenModal';
import { formatTime } from '@/lib/dates';
import { cn } from '@/lib/utils';

const RECEPTION_TRANSITIONS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  fresh: { next: 'preparing', label: 'Enviar a cocina' },
  preparing: { next: 'ready_for_pickup', label: 'Marcar listo' },
  ready_for_pickup: { next: 'dispatched', label: 'Despachar' },
  dispatched: { next: 'delivered', label: 'Marcar entregado' },
};

// Espaciado único de la card: 12px laterales, 10px verticales por sección.
// El radio de la card (20px) = radio de los botones (8px) + padding lateral (12px), para que sean concéntricos.
const SECTION = 'border-t border-neutral-black-10 px-3 py-2.5';

// ─── RecepcionOrderCard ───────────────────────────────────────────────────────

interface RecepcionOrderCardProps {
  order: WorkerOrder;
  kitchens: WorkerKitchen[];
  onStatusChange: (orderId: string, prev: OrderStatus, next: OrderStatus) => Promise<void>;
  onAssignCourier: (orderId: string, courierId: string | null) => Promise<void>;
  onAssignKitchen: (orderId: string, kitchenId: string) => Promise<void>;
  onDelete: (orderId: string) => Promise<void>;
  onPaymentMethodChange?: (orderId: string, previousMethod: string, method: string) => Promise<void>;
  onMarkPaid?: (orderId: string) => Promise<void>;
  onMarkPending?: (orderId: string) => Promise<void>;
}

export const RecepcionOrderCard: React.FC<RecepcionOrderCardProps> = ({
  order,
  kitchens,
  onStatusChange,
  onAssignCourier,
  onAssignKitchen,
  onDelete,
  onPaymentMethodChange,
  onMarkPaid,
  onMarkPending,
}) => {
  const [showOrderMenu, setShowOrderMenu] = useState(false);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [showKitchenModal, setShowKitchenModal] = useState(false);
  const [showPrices, setShowPrices] = useState(false);
  const courierButtonRef = useRef<HTMLButtonElement>(null);

  const transition = (() => {
    if (order.status === 'delivered') {
      return order.payment?.status === 'approved'
        ? { next: 'invoiced' as const, label: 'Facturar' }
        : { next: 'pending_payment' as const, label: 'Cobrar' };
    }
    if (order.status === 'pending_payment' && order.payment?.status === 'approved') {
      return { next: 'invoiced' as const, label: 'Facturar' };
    }
    return RECEPTION_TRANSITIONS[order.status];
  })();

  const isUser = !order.clientId && !!order.userId;
  const cardColor = cardOriginColorMap[getClientOriginKey(isUser, order?.origin)];
  const kitchenName = order.kitchen?.name ?? kitchens.find((k) => k.id === order.kitchenId)?.name;
  const itemCount = order.orderItems.reduce((acc, item) => acc + item.quantity, 0);
  const paid = order.payment?.status === 'approved';

  return (
    <>
      <div
        className={cn(
          'rounded-[20px] border shadow-sm overflow-hidden',
          cardColor ?? 'border-neutral-black-20 bg-white'
        )}
      >
        <OrderStatusStrip status={order.status} className="h-1" />

        <div className="px-3 py-2.5 space-y-2">
          {/* 1. Identificación: número · sede · hora · tiempo transcurrido */}
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={() => setShowOrderMenu(true)}
              className="shrink-0 min-w-7 h-7 px-1.5 flex items-center justify-center bg-primary-red hover:opacity-80 rounded-full text-sm font-bold text-white transition-opacity"
              aria-label={`Opciones de orden #${order.dailyOrderNumber}`}
            >
              {order.dailyOrderNumber}
            </button>
            <button
              type="button"
              onClick={() => setShowKitchenModal(true)}
              title={kitchenName ?? 'Asignar sede'}
              className={cn(
                'flex items-center gap-0.5 min-w-0 text-[11px] hover:text-primary-red transition-colors',
                kitchenName ? 'text-neutral-black-100' : 'text-amber-600 font-semibold'
              )}
            >
              <ChefHat size={11} className="shrink-0" />
              <span className="truncate">{kitchenName ?? 'Sin sede'}</span>
            </button>
            <div className="ml-auto flex items-center gap-1.5 shrink-0 text-[11px] leading-none">
              <span className="font-semibold text-neutral-black-100">{formatTime(order.createdAt)}</span>
              <OrderElapsedTime createdAt={order.createdAt} status={order.status} />
            </div>
          </div>

          {/* Cliente: foto + nombre completo */}
          <div>
            <OrderClientChip
              name={order.client?.name ?? order.user?.name}
              phone={order.client?.phone ?? order.user?.phone}
              clientId={order.clientId}
              avatarSrc={order.client?.photoURL ?? order.user?.photoURL}
              isUser={isUser}
              origin={order?.origin}
              size="sm"
            />
          </div>

          {/* 2. Entrega: dirección (2 líneas) + comentario */}
          <div className="space-y-1.5">
            <OrderAddressRow
              location={order.location}
              address={order.deliveryAddress?.address}
              floor={order.deliveryAddress?.floor}
              compact
            />
            {order.comment && <OrderComment comment={order.comment} compact />}
          </div>
        </div>

        {/* 3. Pedido (sin precios) */}
        <div className={SECTION}>
          <OrderItemsCompactList items={order.orderItems} />
        </div>

        {/* 4. Total con desglose en acordeón */}
        <div className={SECTION}>
          <button
            type="button"
            onClick={() => setShowPrices((prev) => !prev)}
            aria-expanded={showPrices}
            className="w-full flex items-center gap-1 text-left"
          >
            <span className="text-[11px] text-neutral-black-100">{itemCount} prod.</span>
            <span
              className={cn(
                'ml-auto text-sm font-bold tabular-nums',
                paid ? 'text-green-600' : 'text-neutral-black-80'
              )}
            >
              {formatCOP(order.totalPrice)}
            </span>
            <ChevronDown
              size={14}
              className={cn('text-neutral-black-100 shrink-0 transition-transform', showPrices && 'rotate-180')}
            />
          </button>
          {showPrices && <OrderPriceBreakdown items={order.orderItems} deliveryPrice={order.deliveryPrice} />}
        </div>

        {/* 5. Acciones: domiciliario · pago · siguiente paso (una por fila) */}
        <div className={cn(SECTION, 'bg-neutral-black-5/60 space-y-2')}>
          <button
            ref={courierButtonRef}
            type="button"
            onClick={() => setShowCourierModal((prev) => !prev)}
            className={cn(
              'w-full flex items-center gap-1.5 text-xs rounded-lg border px-2 py-1.5 bg-white transition-colors hover:text-primary-red',
              order.courier
                ? 'text-neutral-black-80 border-neutral-black-20'
                : 'text-neutral-black-100 border-dashed border-neutral-black-30'
            )}
          >
            {order.courier?.photoURL ? (
              <img
                src={order.courier.photoURL}
                alt={order.courier.name}
                className="w-4 h-4 rounded-full object-cover shrink-0"
              />
            ) : order.courier?.name ? (
              <span className="w-4 h-4 rounded-full bg-primary-red/15 text-primary-red flex items-center justify-center text-[8px] font-bold shrink-0">
                {order.courier.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <Bike size={13} className="shrink-0" />
            )}
            <span className="truncate font-semibold">{order.courier?.name ?? 'Asignar domiciliario'}</span>
            <ChevronDown size={12} className="ml-auto text-neutral-black-100 shrink-0" />
          </button>

          <OrderPaymentRow
            paymentMethod={order.paymentMethod}
            paid={paid}
            total={order.totalPrice}
            recepcionMode
            compact
            onPaymentMethodChange={
              onPaymentMethodChange
                ? (method) => onPaymentMethodChange(order.id, order.paymentMethod, method)
                : undefined
            }
            onMarkPaid={onMarkPaid ? () => onMarkPaid(order.id) : undefined}
          />

          {transition && (
            <OrderActionButtons
              label={transition.label}
              size="sm"
              fullWidth
              buttonClassName="rounded-lg"
              onConfirm={() => onStatusChange(order.id, order.status, transition.next)}
            />
          )}
        </div>
      </div>

      {showOrderMenu && (
        <OrderNumberMenu
          order={order}
          onClose={() => setShowOrderMenu(false)}
          onOpenKitchenModal={() => setShowKitchenModal(true)}
          onDelete={() => onDelete(order.id)}
          onMarkPending={onMarkPending ? () => onMarkPending(order.id) : undefined}
        />
      )}

      {showCourierModal && (
        <AssignCourierPopover
          anchorRef={courierButtonRef}
          currentCourierId={order.courierId}
          onAssign={(id) => onAssignCourier(order.id, id)}
          onClose={() => setShowCourierModal(false)}
        />
      )}

      {showKitchenModal && (
        <AssignKitchenModal
          kitchens={kitchens}
          currentKitchenId={order.kitchenId}
          onAssign={(id) => onAssignKitchen(order.id, id)}
          onClose={() => setShowKitchenModal(false)}
        />
      )}
    </>
  );
};
