"use client";

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Bike, ChefHat, Copy, Check, Trash2, Loader2, X } from 'lucide-react';
import { WorkerOrder, WorkerKitchen } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { OrderStatusStrip } from '@/components/ui/OrderStatusStrip';
import { OrderItemsList } from '@/components/ui/OrderItemsList';
import { OrderPaymentRow } from '@/components/ui/OrderPaymentRow';
import { OrderActionButtons } from '@/components/ui/OrderActionButtons';
import { OrderAddressRow } from '@/components/ui/OrderAddressRow';
import { OrderComment } from '@/components/ui/OrderComment';
import { OrderNumberChip, OrderClientChip, OrderTimeChip } from '@/components/ui/OrderClientChips';
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

// ─── Order Number Menu ────────────────────────────────────────────────────────

interface OrderNumberMenuProps {
  order: WorkerOrder;
  onClose: () => void;
  onOpenKitchenModal: () => void;
  onDelete: () => Promise<void>;
}

function OrderNumberMenu({ order, onClose, onOpenKitchenModal, onDelete }: OrderNumberMenuProps) {
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return; }
    setLoading(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative z-10 w-[300px] bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3 border-b border-neutral-100">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-neutral-black-50 uppercase tracking-wide">Pedido</p>
            <p className="text-2xl font-bold text-neutral-black-80">#{order.dailyOrderNumber}</p>
            <p className="text-[10px] text-neutral-black-50 font-mono leading-tight mt-0.5 break-all">{order.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-1 rounded-full hover:bg-neutral-100 transition-colors ml-3"
          >
            <X size={16} className="text-neutral-black-50" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col divide-y divide-neutral-100">
          <button
            type="button"
            onClick={handleCopyId}
            className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-neutral-black-80 hover:bg-neutral-50 transition-colors text-left"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 shrink-0">
              {copied
                ? <Check size={15} className="text-green-600" />
                : <Copy size={15} className="text-neutral-black-50" />}
            </span>
            {copied ? 'ID copiado' : 'Copiar ID de orden'}
          </button>

          <button
            type="button"
            onClick={() => { onOpenKitchenModal(); onClose(); }}
            className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-neutral-black-80 hover:bg-neutral-50 transition-colors text-left"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-50 shrink-0">
              <ChefHat size={15} className="text-violet-600" />
            </span>
            Cambiar cocina
          </button>

          {confirming && (
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-neutral-black-50 hover:bg-neutral-50 transition-colors text-left"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 shrink-0">
                <X size={15} className="text-neutral-black-50" />
              </span>
              No cancelar
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className={cn(
              'flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors text-left disabled:opacity-60',
              confirming
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'text-neutral-black-80 hover:bg-neutral-50',
            )}
          >
            <span className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full shrink-0',
              confirming ? 'bg-red-100' : 'bg-red-50',
            )}>
              {loading
                ? <Loader2 size={15} className="text-red-500 animate-spin" />
                : <Trash2 size={15} className="text-red-500" />}
            </span>
            {confirming ? 'Confirmar cancelación' : 'Cancelar orden'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── RecepcionOrderCard ───────────────────────────────────────────────────────

interface RecepcionOrderCardProps {
  order: WorkerOrder;
  kitchens: WorkerKitchen[];
  onStatusChange: (orderId: string, prev: OrderStatus, next: OrderStatus) => Promise<void>;
  onAssignCourier: (orderId: string, courierId: string) => Promise<void>;
  onAssignKitchen: (orderId: string, kitchenId: string) => Promise<void>;
  onPaymentMethodChange?: (orderId: string, previousMethod: string, method: string) => Promise<void>;
  onMarkPaid?: (orderId: string) => Promise<void>;
}

export const RecepcionOrderCard: React.FC<RecepcionOrderCardProps> = ({
  order,
  kitchens,
  onStatusChange,
  onAssignCourier,
  onAssignKitchen,
  onPaymentMethodChange,
  onMarkPaid,
}) => {
  const [showOrderMenu, setShowOrderMenu] = useState(false);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [showKitchenModal, setShowKitchenModal] = useState(false);

  const transition = RECEPTION_TRANSITIONS[order.status];

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
              name={order.client?.name}
              phone={order.client?.phone}
              clientId={order.clientId}
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
          <OrderItemsList items={order.orderItems} />
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
          onDelete={() => onStatusChange(order.id, order.status, 'cancelled')}
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
