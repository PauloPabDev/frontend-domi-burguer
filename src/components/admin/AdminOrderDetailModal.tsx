"use client";

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bike, ChefHat, Loader2, ShieldCheck, Trash2, X } from 'lucide-react';
import { WorkerOrder, WorkerKitchen } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { OrderStatusStrip } from '@/components/ui/OrderStatusStrip';
import { OrderStatusTimeline } from '@/components/ui/OrderStatusTimeline';
import { OrderStatusPicker } from '@/components/ui/OrderStatusPicker';
import { OrderItemsList } from '@/components/ui/OrderItemsList';
import { OrderPaymentRow } from '@/components/ui/OrderPaymentRow';
import { OrderAddressRow } from '@/components/ui/OrderAddressRow';
import { OrderComment } from '@/components/ui/OrderComment';
import { OrderClientChip } from '@/components/ui/OrderClientChips';
import { AssignCourierPopover } from '@/components/recepcion/AssignCourierPopover';
import { AssignKitchenModal } from '@/components/recepcion/AssignKitchenModal';
import { formatDateTime } from '@/lib/dates';

interface AdminOrderDetailModalProps {
  order: WorkerOrder;
  kitchens: WorkerKitchen[];
  onClose: () => void;
  onStatusChange: (orderId: string, prev: OrderStatus, next: OrderStatus) => Promise<void>;
  onAssignCourier: (orderId: string, courierId: string | null) => Promise<void>;
  onAssignKitchen: (orderId: string, kitchenId: string) => Promise<void>;
  onPaymentMethodChange: (orderId: string, previousMethod: string, method: string) => Promise<void>;
  onMarkPaid: (orderId: string) => Promise<void>;
  onMarkPending: (orderId: string) => Promise<void>;
  onDelete: (orderId: string) => Promise<void>;
}

const SECTION = 'border-t border-neutral-black-10 px-5 py-4';

/**
 * Panel de administración de una orden: consolida los procesos de cocina, recepción
 * y courier en un único lugar con permisos de admin — puede saltar a cualquier
 * estado (incluso retroceder) y corregir el estado de pago. El backend es quien
 * valida en última instancia que el usuario tenga rol admin.
 */
export function AdminOrderDetailModal({
  order,
  kitchens,
  onClose,
  onStatusChange,
  onAssignCourier,
  onAssignKitchen,
  onPaymentMethodChange,
  onMarkPaid,
  onMarkPending,
  onDelete,
}: AdminOrderDetailModalProps) {
  const [showCourierPopover, setShowCourierPopover] = useState(false);
  const [showKitchenModal, setShowKitchenModal] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const courierButtonRef = useRef<HTMLButtonElement>(null);

  const clientName = order.client?.name ?? order.user?.name;
  const clientPhone = order.client?.phone ?? order.user?.phone;
  const isUser = !order.clientId && !!order.userId;

  const handleDelete = async () => {
    if (!confirmingDelete) { setConfirmingDelete(true); return; }
    setDeleting(true);
    try {
      await onDelete(order.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-3 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck size={16} className="text-primary-red shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-neutral-black-50 uppercase tracking-wide">
                Pedido · {formatDateTime(order.createdAt)}
              </p>
              <p className="text-2xl font-bold text-neutral-black-80 leading-none">#{order.dailyOrderNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-1 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={16} className="text-neutral-black-50" />
          </button>
        </div>

        <div className="overflow-y-auto">
          <OrderStatusStrip status={order.status} />

          <OrderStatusTimeline status={order.status} timeLapseStatus={order.timeLapseStatus} />

          {/* Cliente */}
          <div className={SECTION}>
            <p className="text-[10px] font-bold text-neutral-black-50 uppercase tracking-wide mb-2">Cliente</p>
            <OrderClientChip
              name={clientName}
              phone={clientPhone}
              clientId={order.clientId}
              avatarSrc={order.client?.photoURL ?? order.user?.photoURL}
              isUser={isUser}
              origin={order.origin}
              phoneVisible
            />
          </div>

          {/* Dirección */}
          <div className={SECTION}>
            <p className="text-[10px] font-bold text-neutral-black-50 uppercase tracking-wide mb-2">Dirección</p>
            <OrderAddressRow
              location={order.location}
              address={order.deliveryAddress?.address}
              floor={order.deliveryAddress?.floor}
            />
          </div>

          {order.comment && (
            <div className={SECTION}>
              <OrderComment comment={order.comment} />
            </div>
          )}

          {/* Productos */}
          <div className={SECTION}>
            <p className="text-[10px] font-bold text-neutral-black-50 uppercase tracking-wide mb-3">Productos</p>
            <OrderItemsList items={order.orderItems} deliveryPrice={order.deliveryPrice} />
          </div>

          {/* Pago */}
          <div className={SECTION}>
            <p className="text-[10px] font-bold text-neutral-black-50 uppercase tracking-wide mb-3">Pago</p>
            <OrderPaymentRow
              paymentMethod={order.paymentMethod}
              paid={order.payment?.status === 'approved'}
              total={order.totalPrice}
              recepcionMode
              onPaymentMethodChange={(method) => onPaymentMethodChange(order.id, order.paymentMethod, method)}
              onMarkPaid={() => onMarkPaid(order.id)}
              onMarkPending={() => onMarkPending(order.id)}
            />
          </div>

          {/* Cocina y domiciliario */}
          <div className={`${SECTION} flex flex-wrap gap-2`}>
            <button
              type="button"
              onClick={() => setShowKitchenModal(true)}
              className="flex items-center gap-2 text-xs font-semibold text-neutral-black-80 hover:text-primary-red border border-neutral-black-20 rounded-xl px-3 py-2 transition-colors"
            >
              <ChefHat size={13} />
              {order.kitchen?.name ?? 'Asignar cocina'}
            </button>
            <button
              ref={courierButtonRef}
              type="button"
              onClick={() => setShowCourierPopover((v) => !v)}
              className="flex items-center gap-2 text-xs font-semibold text-neutral-black-80 hover:text-primary-red border border-neutral-black-20 rounded-xl px-3 py-2 transition-colors"
            >
              <Bike size={13} />
              {order.courier?.name ?? 'Asignar domiciliario'}
            </button>
          </div>

          {/* Cambiar estado (override de admin) */}
          <div className={SECTION}>
            <p className="text-[10px] font-bold text-neutral-black-50 uppercase tracking-wide mb-2">
              Forzar estado (admin)
            </p>
            <OrderStatusPicker
              currentStatus={order.status}
              onSelect={(next) => onStatusChange(order.id, order.status, next)}
            />
          </div>

          {/* Cancelar orden */}
          <div className={SECTION}>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${
                confirmingDelete ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'text-neutral-black-50 hover:bg-neutral-black-5'
              }`}
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {confirmingDelete ? 'Confirmar cancelación de la orden' : 'Cancelar orden'}
            </button>
            {confirmingDelete && !deleting && (
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="w-full text-center text-xs text-neutral-black-50 hover:text-neutral-black-80 mt-1.5"
              >
                No cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {showCourierPopover && (
        <AssignCourierPopover
          anchorRef={courierButtonRef}
          currentCourierId={order.courierId}
          onAssign={(id) => onAssignCourier(order.id, id)}
          onClose={() => setShowCourierPopover(false)}
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
    </div>,
    document.body,
  );
}
