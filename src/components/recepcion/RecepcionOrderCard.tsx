"use client";

import { useState } from 'react';
import { Bike } from 'lucide-react';
import { WorkerOrder, WorkerKitchen } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { OrderStatusStrip } from '@/components/ui/OrderStatusStrip';
import { OrderItemsList } from '@/components/ui/OrderItemsList';
import { OrderPaymentRow } from '@/components/ui/OrderPaymentRow';
import { OrderActionButtons } from '@/components/ui/OrderActionButtons';
import { OrderAddressRow } from '@/components/ui/OrderAddressRow';
import { OrderComment } from '@/components/ui/OrderComment';
import { OrderNumberChip, OrderClientChip, OrderTimeChip } from '@/components/ui/OrderClientChips';
import { OrderNumberMenu } from './OrderNumberMenu';
import { AssignCourierModal } from './AssignCourierModal';
import { AssignKitchenModal } from './AssignKitchenModal';
import { formatTime } from '@/lib/dates';
import { cn } from '@/lib/utils';

const RECEPTION_TRANSITIONS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  fresh: { next: 'preparing', label: 'Enviar a cocina' },
  preparing: { next: 'ready_for_pickup', label: 'Marcar listo' },
  ready_for_pickup: { next: 'dispatched', label: 'Despachar' },
  dispatched: { next: 'delivered', label: 'Marcar entregado' },
};

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
}) => {
  const [showOrderMenu, setShowOrderMenu] = useState(false);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [showKitchenModal, setShowKitchenModal] = useState(false);

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

  return (
    <>
      <div className="rounded-2xl border border-neutral-black-20 bg-white shadow-sm overflow-hidden">
        <OrderStatusStrip status={order.status} />

        {/* Header: número · cliente · hora */}
        <div className="p-3 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOrderMenu(true)}
              className="shrink-0 hover:opacity-80 transition-opacity"
              aria-label={`Opciones de orden #${order.dailyOrderNumber}`}
            >
              <OrderNumberChip orderNumber={order.dailyOrderNumber} />
            </button>
            <OrderClientChip
              name={order.client?.name ?? order.user?.name}
              phone={order.client?.phone ?? order.user?.phone}
              clientId={order.clientId}
              avatarSrc={order.client?.photoURL ?? order.user?.photoURL}
              isUser={!order.clientId && !!order.userId}
              origin={order?.origin}
            />
            <OrderTimeChip time={formatTime(order.createdAt)} className="ml-auto" />
          </div>
        </div>

        {/* Dirección corta */}
        <div className="px-3 pb-2">
          <OrderAddressRow
            location={order.location}
            address={order.deliveryAddress?.address}
            floor={order.deliveryAddress?.floor}
            compact
          />
        </div>

        {/* Comentario */}
        {order.comment && (
          <div className="px-3 pb-2">
            <OrderComment comment={order.comment} compact />
          </div>
        )}

        {/* Productos */}
        <div className={SECTION}>
          <OrderItemsList items={order.orderItems} deliveryPrice={order.deliveryPrice} />
        </div>

        {/* Pago y total */}
        <div className={SECTION}>
          <OrderPaymentRow
            paymentMethod={order.paymentMethod}
            paid={order.payment?.status === 'approved'}
            total={order.totalPrice}
            muted
            recepcionMode
            onPaymentMethodChange={
              onPaymentMethodChange
                ? (method) => onPaymentMethodChange(order.id, order.paymentMethod, method)
                : undefined
            }
            onMarkPaid={onMarkPaid ? () => onMarkPaid(order.id) : undefined}
          />
        </div>

        {/* Footer: domiciliario + acción */}
        <div className={cn(SECTION, 'flex items-center gap-2')}>
          <button
            type="button"
            onClick={() => setShowCourierModal(true)}
            className="flex items-center gap-1.5 text-xs text-neutral-black-50 hover:text-primary-red border border-neutral-black-20 rounded-lg px-2 py-1.5 transition-colors shrink-0"
          >
            <Bike size={11} />
            <span className="max-w-[70px] truncate">{order.courier?.name ?? 'Moto'}</span>
          </button>

          {transition && (
            <OrderActionButtons
              label={transition.label}
              onConfirm={() => onStatusChange(order.id, order.status, transition.next)}
              className="ml-auto"
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
        />
      )}

      {showCourierModal && (
        <AssignCourierModal
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
