"use client";

import { useRef, useState } from 'react';
import { ArrowRight, Banknote, Bike, Check, ChefHat, ChevronDown, Copy, PackageCheck, Receipt, type LucideIcon } from 'lucide-react';
import { WorkerOrder, WorkerKitchen } from '@/types/worker';
import { OrderStatus, PaymentStatus } from '@/types/orders';
import { PaymentChangeRequestInput } from '@/types/paymentChangeRequest';
import { OrderStatusStrip } from '@/components/ui/OrderStatusStrip';
import { formatCOP } from '@/components/ui/OrderItemsList';
import { OrderPaymentRow, getCashChange } from '@/components/ui/OrderPaymentRow';
import { OrderActionButtons } from '@/components/ui/OrderActionButtons';
import { OrderAddressRow } from '@/components/ui/OrderAddressRow';
import { OrderComment } from '@/components/ui/OrderComment';
import { OrderItemsCompactList, OrderItemsSummary, OrderPriceBreakdown } from '@/components/ui/OrderItemsCompactList';
import { OrderElapsedTime } from '@/components/ui/OrderElapsedTime';
import { OrderClientChip, getClientOriginKey, cardOriginColorMap } from '@/components/ui/OrderClientChips';
import { OrderNumberMenu } from './OrderNumberMenu';
import { AssignCourierPopover } from './AssignCourierPopover';
import { AssignKitchenModal } from './AssignKitchenModal';
import { PaymentChangeModal } from './PaymentChangeModal';
import { formatTime } from '@/lib/dates';
import { cn } from '@/lib/utils';

const RECEPTION_TRANSITIONS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  fresh: { next: 'preparing', label: 'Enviar a cocina' },
  preparing: { next: 'ready_for_pickup', label: 'Marcar listo' },
  ready_for_pickup: { next: 'dispatched', label: 'Despachar' },
  dispatched: { next: 'delivered', label: 'Marcar entregado' },
};

// Ícono del botón circular de la vista simple, según el estado al que lleva
const TRANSITION_ICONS: Partial<Record<OrderStatus, LucideIcon>> = {
  preparing: ChefHat,
  ready_for_pickup: Check,
  dispatched: Bike,
  delivered: PackageCheck,
  pending_payment: Banknote,
  invoiced: Receipt,
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
  /** Solo admin: cambiar el método de pago */
  onPaymentMethodChange?: (orderId: string, previousMethod: string, method: string) => Promise<void>;
  /** Aprobar el pago (cobro normal): recepción y admin */
  onMarkPaid?: (orderId: string) => Promise<void>;
  /** Solo admin: cambiar el estado del pago a cualquier valor */
  onPaymentStatusChange?: (orderId: string, status: PaymentStatus) => Promise<void>;
  /** Recepción: pedirle a un admin un cambio de método o estado del pago */
  onRequestPaymentChange?: (orderId: string, input: PaymentChangeRequestInput) => Promise<void>;
  /** Vista simple: número, cliente, resumen de productos, domiciliario, total y siguiente paso */
  compact?: boolean;
  /** Vista simple: clic en la card (fuera de sus botones) para ver el detalle completo */
  onOpenDetail?: () => void;
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
  onPaymentStatusChange,
  onRequestPaymentChange,
  compact = false,
  onOpenDetail,
}) => {
  const [showOrderMenu, setShowOrderMenu] = useState(false);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [showKitchenModal, setShowKitchenModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPrices, setShowPrices] = useState(false);
  const [showItems, setShowItems] = useState(true);
  const [totalCopied, setTotalCopied] = useState(false);
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

  const TransitionIcon = transition ? TRANSITION_ICONS[transition.next] ?? ArrowRight : ArrowRight;

  const isUser = !order.clientId && !!order.userId;
  const cardColor = cardOriginColorMap[getClientOriginKey(isUser, order?.origin)];
  const kitchenName = order.kitchen?.name ?? kitchens.find((k) => k.id === order.kitchenId)?.name;
  const itemCount = order.orderItems.reduce((acc, item) => acc + item.quantity, 0);
  const paid = order.payment?.status === 'approved';
  const cashChange =
    order.paymentMethod === 'cash' && order.totalPrice > 0 ? getCashChange(order.totalPrice) : null;
  const clientName = order.client?.name ?? order.user?.name ?? 'Sin nombre';

  // Admin cambia el pago directamente; recepción solo puede solicitarlo
  const canApplyPaymentChange = !!onPaymentMethodChange && !!onPaymentStatusChange;
  const paymentChangeMode = canApplyPaymentChange ? 'apply' : onRequestPaymentChange ? 'request' : undefined;

  const handlePaymentChange = async (change: PaymentChangeRequestInput) => {
    if (paymentChangeMode === 'request') {
      await onRequestPaymentChange?.(order.id, change);
    } else if (change.type === 'paymentMethod') {
      await onPaymentMethodChange?.(order.id, order.paymentMethod, change.value);
    } else {
      await onPaymentStatusChange?.(order.id, change.value);
    }
  };

  const handleCopyTotal = async () => {
    try {
      await navigator.clipboard.writeText(String(order.totalPrice));
      setTotalCopied(true);
      setTimeout(() => setTotalCopied(false), 1500);
    } catch {
      // Sin permiso de portapapeles: el valor sigue siendo seleccionable a mano
    }
  };

  const courierAvatar = (sizeClass: string, iconSize: number) =>
    order.courier?.photoURL ? (
      <img
        src={order.courier.photoURL}
        alt={order.courier.name}
        className={cn(sizeClass, 'rounded-full object-cover shrink-0')}
      />
    ) : order.courier?.name ? (
      <span
        className={cn(
          sizeClass,
          'rounded-full bg-primary-red/15 text-primary-red flex items-center justify-center font-bold shrink-0'
        )}
      >
        {order.courier.name.charAt(0).toUpperCase()}
      </span>
    ) : (
      <Bike size={iconSize} className="shrink-0" />
    );

  const totalButton = (
    // Total: clic para copiar el valor (solo dígitos, listo para pegar en Nequi / Bancolombia)
    <button
      type="button"
      onClick={handleCopyTotal}
      title="Copiar total"
      className={cn(
        'ml-auto flex items-center gap-1 rounded-lg px-1.5 py-0.5 -mr-1.5 text-sm font-bold tabular-nums select-text hover:bg-neutral-black-5 transition-colors',
        paid ? 'text-green-600' : 'text-neutral-black-80'
      )}
    >
      {formatCOP(order.totalPrice)}
      {totalCopied ? (
        <Check size={12} className="text-green-600 shrink-0" />
      ) : (
        <Copy size={12} className="text-neutral-black-100 shrink-0" />
      )}
    </button>
  );

  // Los botones de la card conservan su acción; los clics que llegan por
  // burbujeo desde los portales (menú de la orden, popover del domiciliario)
  // no están dentro del DOM de la card y se ignoran.
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!e.currentTarget.contains(target) || target.closest('button, a')) return;
    onOpenDetail?.();
  };

  return (
    <>
      {compact ? (
        // Vista simple: una sola fila, de izquierda a derecha en el orden en que se lee una orden:
        // número · cliente · productos · domiciliario · total · siguiente paso (siempre en el borde derecho)
        <div
          className={cn(
            'relative h-full rounded-2xl border shadow-sm overflow-hidden pl-3 pr-2 py-2 flex items-center gap-2.5',
            onOpenDetail && 'cursor-pointer hover:shadow-md transition-shadow',
            cardColor ?? 'border-neutral-black-20 bg-white'
          )}
          onClick={onOpenDetail ? handleCardClick : undefined}
        >
          <OrderStatusStrip status={order.status} className="absolute inset-y-0 left-0 w-1 h-auto" />

          <button
            type="button"
            onClick={() => setShowOrderMenu(true)}
            className="shrink-0 min-w-9 h-9 px-1.5 flex items-center justify-center bg-primary-red hover:opacity-80 rounded-full text-sm font-bold text-white transition-opacity"
            aria-label={`Opciones de orden #${order.dailyOrderNumber}`}
          >
            {order.dailyOrderNumber}
          </button>

          {/* Cliente · tiempo transcurrido: ancho según el nombre (tope 9rem), el sobrante queda para los productos */}
          <div className="max-w-36 shrink-0 min-w-0 space-y-0.5">
            <p title={clientName} className="truncate text-xs font-semibold text-neutral-black-80">
              {clientName}
            </p>
            <OrderElapsedTime createdAt={order.createdAt} status={order.status} className="text-[11px] leading-none" />
          </div>

          {/* Productos: saltan de renglón si no caben; complementos en cadena debajo de cada uno */}
          <div className="flex-1 min-w-0">
            <OrderItemsSummary items={order.orderItems} inline />
          </div>

          {/* Domiciliario: círculo con contorno (nombre en el tooltip) */}
          <button
            ref={courierButtonRef}
            type="button"
            onClick={() => setShowCourierModal((prev) => !prev)}
            title={order.courier?.name ?? 'Asignar domiciliario'}
            aria-label={order.courier?.name ?? 'Asignar domiciliario'}
            className={cn(
              'shrink-0 w-8 h-8 p-0.5 flex items-center justify-center rounded-full border-[1.5px] bg-white transition-colors',
              order.courier
                ? 'border-neutral-black-80 text-neutral-black-80 hover:border-primary-red'
                : 'border-dashed border-primary-red text-primary-red hover:bg-primary-red/5'
            )}
          >
            {courierAvatar('w-full h-full text-[10px]', 14)}
          </button>

          <div className="shrink-0">{totalButton}</div>

          {transition && (
            <OrderActionButtons
              label={transition.label}
              icon={<TransitionIcon size={16} />}
              className="shrink-0"
              onConfirm={() => onStatusChange(order.id, order.status, transition.next)}
            />
          )}
        </div>
      ) : (
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
              {/* Sede: solo informativa; se cambia desde el menú del número de orden */}
              <span
                title={kitchenName ?? 'Sin sede'}
                className={cn(
                  'flex items-center gap-0.5 min-w-0 text-[11px]',
                  kitchenName ? 'text-neutral-black-100' : 'text-amber-600 font-semibold'
                )}
              >
                <ChefHat size={11} className="shrink-0" />
                <span className="truncate">{kitchenName ?? 'Sin sede'}</span>
              </span>
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
                avatarSrc={order.clientId ? order.client?.photoURL : order.user?.photoURL}
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

          {/* 3. Pedido (sin precios), colapsable: resumen de cantidades por color */}
          <div className={SECTION}>
            <button
              type="button"
              onClick={() => setShowItems((prev) => !prev)}
              aria-expanded={showItems}
              aria-label={showItems ? 'Colapsar productos' : 'Ver productos'}
              className="w-full flex items-start gap-1 text-left"
            >
              {showItems ? (
                <span className="text-[11px] font-semibold text-neutral-black-100">
                  Pedido · {itemCount} prod.
                </span>
      ) : (
                <div className="flex-1 min-w-0">
                  <OrderItemsSummary items={order.orderItems} />
                </div>
              )}
              <ChevronDown
                size={14}
                className={cn(
                  'ml-auto text-neutral-black-100 shrink-0 transition-transform',
                  showItems ? 'rotate-180' : 'mt-1'
                )}
              />
            </button>
            {showItems && (
              <div className="mt-1.5">
                <OrderItemsCompactList items={order.orderItems} />
              </div>
            )}
          </div>

          {/* 4. Total con desglose en acordeón */}
          <div className={SECTION}>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPrices((prev) => !prev)}
                aria-expanded={showPrices}
                aria-label={showPrices ? 'Ocultar desglose de precios' : 'Ver desglose de precios'}
                className="flex items-center gap-0.5 text-[11px] text-neutral-black-100 hover:text-neutral-black-80 transition-colors"
              >
                {/* Con domicilio se muestra su costo en lugar del conteo de productos */}
                {order.deliveryPrice > 0 ? (
                  <span className="flex items-center gap-0.5 font-semibold tabular-nums" title="Domicilio">
                    <Bike size={12} className="shrink-0" />
                    {formatCOP(order.deliveryPrice)}
                  </span>
                ) : (
                  `${itemCount} prod.`
                )}
                <ChevronDown
                  size={14}
                  className={cn('shrink-0 transition-transform', showPrices && 'rotate-180')}
                />
              </button>

              {totalButton}
            </div>
            {/* Vueltas en efectivo, junto al total para leer los precios en un solo lugar */}
            {cashChange && !paid && (
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-dashed border-neutral-black-10 text-[11px] tabular-nums">
                <span className="text-neutral-black-100">Con {formatCOP(cashChange.bill)}</span>
                <span className="font-semibold text-amber-600">Devolver {formatCOP(cashChange.change)}</span>
              </div>
            )}
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
              {courierAvatar('w-4 h-4 text-[8px]', 13)}
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
      )}

      {showOrderMenu && (
        <OrderNumberMenu
          order={order}
          onClose={() => setShowOrderMenu(false)}
          onOpenKitchenModal={() => setShowKitchenModal(true)}
          onDelete={() => onDelete(order.id)}
          paymentChangeMode={paymentChangeMode}
          onOpenPaymentChange={() => setShowPaymentModal(true)}
        />
      )}

      {showPaymentModal && paymentChangeMode && (
        <PaymentChangeModal
          order={order}
          mode={paymentChangeMode}
          onSubmit={handlePaymentChange}
          onClose={() => setShowPaymentModal(false)}
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
