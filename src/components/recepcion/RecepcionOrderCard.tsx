"use client";

import { useState } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp, Bike, ChefHat } from 'lucide-react';
import { WorkerOrder, WorkerUser, WorkerKitchen } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { StatusStepBar, StatusStep } from '@/components/ui/StatusStepBar';
import { OrderItemsList } from '@/components/ui/OrderItemsList';
import { OrderCardNumber } from '@/components/ui/OrderCardNumber';
import { OrderClientInfo } from '@/components/ui/OrderClientInfo';
import { OrderStatusStrip } from '@/components/ui/OrderStatusStrip';
import { OrderComment } from '@/components/ui/OrderComment';
import { OrderAddressRow } from '@/components/ui/OrderAddressRow';
import { OrderPaymentRow } from '@/components/ui/OrderPaymentRow';
import { OrderActionButtons } from '@/components/ui/OrderActionButtons';
import { AssignCourierModal } from './AssignCourierModal';
import { AssignKitchenModal } from './AssignKitchenModal';

const RECEPTION_STEPS: StatusStep[] = [
  { key: 'fresh', label: 'Nuevo' },
  { key: 'preparing', label: 'Cocina' },
  { key: 'ready_for_pickup', label: 'Listo' },
  { key: 'dispatched', label: 'Camino' },
  { key: 'delivered', label: 'Entregado' },
];

interface RecepcionOrderCardProps {
  order: WorkerOrder;
  couriers: WorkerUser[];
  kitchens: WorkerKitchen[];
  onStatusChange: (orderId: string, prev: OrderStatus, next: OrderStatus) => Promise<void>;
  onAssignCourier: (orderId: string, courierId: string) => Promise<void>;
  onAssignKitchen: (orderId: string, kitchenId: string) => Promise<void>;
}

const RECEPTION_TRANSITIONS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  fresh:            { next: 'preparing',        label: 'Enviar a cocina' },
  preparing:        { next: 'ready_for_pickup', label: 'Marcar listo' },
  ready_for_pickup: { next: 'dispatched',       label: 'Despachar' },
  dispatched:       { next: 'delivered',        label: 'Marcar entregado' },
};

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

export const RecepcionOrderCard: React.FC<RecepcionOrderCardProps> = ({
  order,
  couriers,
  kitchens,
  onStatusChange,
  onAssignCourier,
  onAssignKitchen,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [showKitchenModal, setShowKitchenModal] = useState(false);

  const transition = RECEPTION_TRANSITIONS[order.status];

  return (
    <>
      <div className="rounded-2xl border border-neutral-black-20 bg-white shadow-sm overflow-hidden">
        <OrderStatusStrip status={order.status} />

        {/* Header */}
        <div className="p-3">
          <div className="flex items-start gap-2">
            <OrderCardNumber number={order.dailyOrderNumber} size="sm" className="mt-0.5" />
            <OrderClientInfo
              name={order.client?.name}
              phone={order.client?.phone}
              time={formatTime(order.createdAt)}
              nameSize="sm"
              onPhoneClick={(e) => e.stopPropagation()}
              className="flex-1"
            />
            <button
              onClick={() => setExpanded((v) => !v)}
              className="p-1 text-neutral-black-50 hover:text-neutral-black-80 shrink-0"
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>

          <div className="mt-2">
            <StatusStepBar steps={RECEPTION_STEPS} currentStatus={order.status} compact />
          </div>

          <OrderAddressRow
            address={order.deliveryAddress?.address}
            compact
            className="mt-2"
          />

          {order.comment && <OrderComment comment={order.comment} compact className="mt-2" />}
        </div>

        {/* Contenido expandible */}
        {expanded && (
          <div className="px-3 pb-3 space-y-2 border-t border-neutral-black-10 pt-3">
            <div>
              <div className="flex items-center gap-1 mb-2">
                <ShoppingBag size={11} className="text-neutral-black-50" />
                <span className="text-[10px] font-bold text-neutral-black-50 uppercase tracking-wide">Productos</span>
              </div>
              <OrderItemsList items={order.orderItems} />
            </div>

            <OrderPaymentRow
              paymentMethod={order.paymentMethod}
              total={order.totalPrice}
              withBorderTop
              muted
            />

            <div className="flex gap-2 border-t border-neutral-black-10 pt-2">
              <button
                onClick={() => setShowCourierModal(true)}
                className="flex-1 flex items-center gap-1.5 text-xs text-neutral-black-50 hover:text-neutral-black-80 transition-colors"
              >
                <Bike size={11} />
                <span className="truncate">{order.courier?.name ?? 'Sin domiciliario'}</span>
              </button>
              <button
                onClick={() => setShowKitchenModal(true)}
                className="flex-1 flex items-center gap-1.5 text-xs text-neutral-black-50 hover:text-neutral-black-80 transition-colors"
              >
                <ChefHat size={11} />
                <span className="truncate">{order.kitchen?.name ?? 'Sin cocina'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Acciones */}
        {(transition || !expanded) && (
          <div className="px-3 pb-3 flex gap-2">
            {!expanded && !confirming && (
              <button
                onClick={() => setShowCourierModal(true)}
                className="flex items-center gap-1 text-[10px] text-neutral-black-50 hover:text-primary-red border border-neutral-black-20 rounded-lg px-2 py-1.5 transition-colors"
              >
                <Bike size={10} />
                <span>{order.courier?.name ?? 'Moto'}</span>
              </button>
            )}
            {transition && (
              <OrderActionButtons
                label={transition.label}
                onConfirm={() => onStatusChange(order.id, order.status, transition.next)}
                onConfirmingChange={setConfirming}
                className="ml-auto"
              />
            )}
          </div>
        )}
      </div>

      {showCourierModal && (
        <AssignCourierModal
          couriers={couriers}
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
