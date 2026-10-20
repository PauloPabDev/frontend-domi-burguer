"use client";

import { useEffect, useRef, useState } from 'react';
import { Bike, ChefHat, ChevronDown, Clock } from 'lucide-react';
import { WorkerOrder, WorkerKitchen } from '@/types/worker';
import { OrderItem, OrderStatus } from '@/types/orders';
import { OrderStatusStrip } from '@/components/ui/OrderStatusStrip';
import { formatCOP } from '@/components/ui/OrderItemsList';
import { OrderPaymentRow } from '@/components/ui/OrderPaymentRow';
import { OrderActionButtons } from '@/components/ui/OrderActionButtons';
import { OrderAddressRow } from '@/components/ui/OrderAddressRow';
import { OrderComment } from '@/components/ui/OrderComment';
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

// Estados en los que el tiempo transcurrido sigue siendo relevante para recepción
const TIMED_STATUSES: OrderStatus[] = ['fresh', 'preparing', 'ready_for_pickup', 'dispatched'];

// Umbrales (minutos) para colorear el tiempo transcurrido
const ELAPSED_WARN_MIN = 20;
const ELAPSED_LATE_MIN = 35;

const SECTION = 'border-t border-neutral-black-10 px-2 py-2';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useElapsedMinutes(createdAt: string, active: boolean) {
  const getMinutes = () => Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000));
  const [minutes, setMinutes] = useState(getMinutes);

  useEffect(() => {
    if (!active) return;
    setMinutes(getMinutes());
    const id = setInterval(() => setMinutes(getMinutes()), 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdAt, active]);

  return minutes;
}

// La cantidad de un complemento es por unidad del producto: 4 combos con 2 papas = 8 papas.
// Se muestra el total y, si el producto tiene más de una unidad, la multiplicación que lo explica.
function getComplementQuantities(item: OrderItem, complement: OrderItem) {
  const perUnit = complement.quantity || 1;
  return {
    total: perUnit * item.quantity,
    formula: item.quantity > 1 ? `${perUnit}×${item.quantity}` : null,
  };
}

function CompactItemsList({ items }: { items: OrderItem[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item, index) => (
        <li key={index}>
          <div className="flex items-start gap-1.5">
            <span
              className="min-w-5 h-5 px-1 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
              style={{ backgroundColor: item.colorPrimary ?? 'var(--color-primary-red)' }}
            >
              {item.quantity}
            </span>
            <span className="text-[13px] font-bold text-neutral-black-80 leading-tight pt-0.5 line-clamp-2">
              {item.name}
            </span>
          </div>

          {item.complements && item.complements.length > 0 && (
            <ul className="pl-6 mt-0.5 space-y-0.5">
              {item.complements.map((c, i) => {
                const { total, formula } = getComplementQuantities(item, c);
                return (
                  <li key={i} className="flex items-start gap-1 text-[11px] text-neutral-black-100 leading-tight">
                    <span
                      className="min-w-4 h-4 px-0.5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                      style={{ backgroundColor: c.colorPrimary ?? 'var(--color-neutral-black-60)' }}
                    >
                      {total}
                    </span>
                    <span className="pt-px">
                      <span className="font-semibold text-neutral-black-80">{c.name}</span>
                      {c.codes?.length ? ` (${c.codes.join(', ')})` : ''}
                      {formula && <span className="ml-1 text-[10px] text-neutral-black-100">({formula})</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {item.notes && (
            <p className="pl-6 text-[11px] italic text-amber-700 leading-tight line-clamp-2">{item.notes}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

function PriceRow({ label, value, muted = false }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className={cn('flex items-start justify-between gap-2', muted ? 'text-neutral-black-100' : 'text-neutral-black-80')}>
      <span className="min-w-0 leading-tight">{label}</span>
      <span className="shrink-0 tabular-nums">{formatCOP(value)}</span>
    </div>
  );
}

function PriceBreakdown({ items, deliveryPrice }: { items: OrderItem[]; deliveryPrice: number }) {
  return (
    <div className="space-y-0.5 text-[11px] pt-1">
      {items.map((item, index) => (
        <div key={index} className="space-y-0.5">
          <PriceRow label={`${item.quantity}× ${item.name ?? ''}`} value={item.price * item.quantity} />
          {item.complements?.map((c, i) => {
            const { total, formula } = getComplementQuantities(item, c);
            return (
              <div key={i} className="pl-3">
                <PriceRow
                  label={`${total} ${c.name ?? ''}${formula ? ` (${formula})` : ''}`}
                  value={c.price * total}
                  muted
                />
              </div>
            );
          })}
        </div>
      ))}
      {deliveryPrice > 0 && (
        <div className="pt-0.5 mt-0.5 border-t border-neutral-black-10">
          <PriceRow label="Domicilio" value={deliveryPrice} />
        </div>
      )}
    </div>
  );
}

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

  const isTimed = TIMED_STATUSES.includes(order.status);
  const elapsed = useElapsedMinutes(order.createdAt, isTimed);

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
          'rounded-xl border shadow-sm overflow-hidden',
          cardColor ?? 'border-neutral-black-20 bg-white'
        )}
      >
        <OrderStatusStrip status={order.status} className="h-1" />

        {/* 1. Identificación: número · sede · hora · tiempo transcurrido */}
        <div className="flex items-center gap-1.5 px-2 pt-2 min-w-0">
          <button
            type="button"
            onClick={() => setShowOrderMenu(true)}
            className="shrink-0 bg-primary-red hover:opacity-80 rounded-full px-2 py-0.5 text-sm font-bold text-white transition-opacity"
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
            {isTimed && (
              <span
                className={cn(
                  'flex items-center gap-0.5 font-bold',
                  elapsed >= ELAPSED_LATE_MIN
                    ? 'text-primary-red'
                    : elapsed >= ELAPSED_WARN_MIN
                      ? 'text-amber-600'
                      : 'text-neutral-black-100'
                )}
              >
                <Clock size={10} />
                {elapsed}m
              </span>
            )}
          </div>
        </div>

        {/* Cliente: foto + nombre completo */}
        <div className="px-2 pt-1.5">
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
        <div className="px-2 pt-1.5 pb-2 space-y-1">
          <OrderAddressRow
            location={order.location}
            address={order.deliveryAddress?.address}
            floor={order.deliveryAddress?.floor}
            compact
          />
          {order.comment && <OrderComment comment={order.comment} compact />}
        </div>

        {/* 3. Pedido (sin precios) */}
        <div className={SECTION}>
          <CompactItemsList items={order.orderItems} />
        </div>

        {/* 4. Total con desglose en acordeón */}
        <div className="border-t border-neutral-black-10 px-2 py-1.5">
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
          {showPrices && <PriceBreakdown items={order.orderItems} deliveryPrice={order.deliveryPrice} />}
        </div>

        {/* 5. Acciones: domiciliario · pago · siguiente paso (una por fila) */}
        <div className="border-t border-neutral-black-10 bg-neutral-black-5/60 px-2 py-2 space-y-1.5">
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
