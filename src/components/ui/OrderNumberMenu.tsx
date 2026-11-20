'use client';

import { useState } from 'react';
import { ChefHat, Copy, Check, CreditCard, Trash2, Send, Loader2, X } from 'lucide-react';
import { WorkerOrder } from '@/types/worker';
import { Modal, ModalHeader } from '@/components/ui/modal';
import { OrderStatusTimeline } from '@/components/ui/OrderStatusTimeline';
import { cn } from '@/lib/utils';

export interface OrderNumberMenuProps {
  order: WorkerOrder;
  onClose: () => void;
  /** Sin valor no se muestra "Cambiar cocina" (solo recepción) */
  onOpenKitchenModal?: () => void;
  /** Sin valor no se muestra "Cancelar orden" (solo recepción) */
  onDelete?: () => Promise<void>;
  /** apply: admin cambia el pago · request: recepción solicita el cambio. Sin valor no se muestra. */
  paymentChangeMode?: 'apply' | 'request';
  onOpenPaymentChange?: () => void;
}

interface ActionRowProps {
  icon: React.ReactNode;
  /** Clase de fondo del círculo del icono */
  iconBg: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

function ActionRow({ icon, iconBg, onClick, disabled, className, children }: ActionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-neutral-black-80 hover:bg-neutral-50 transition-colors text-left disabled:opacity-60',
        className,
      )}
    >
      <span className={cn('flex items-center justify-center w-8 h-8 rounded-full shrink-0', iconBg)}>{icon}</span>
      {children}
    </button>
  );
}

export function OrderNumberMenu({
  order,
  onClose,
  onOpenKitchenModal,
  onDelete,
  paymentChangeMode,
  onOpenPaymentChange,
}: OrderNumberMenuProps) {
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
      await onDelete?.();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    // `contents`: el wrapper no afecta el layout; frena que los clics suban a la card clicable que contiene el menú
    <div className="contents" onClick={(e) => e.stopPropagation()}>
      <Modal
        open
        onOpenChange={(open) => { if (!open) onClose(); }}
        size="md"
        ariaLabel={`Pedido #${order.dailyOrderNumber}`}
        bodyClassName="p-0 sm:p-0"
        customHeader={
          <ModalHeader className="pb-3 pr-14 border-b border-neutral-100">
            <p className="text-[10px] font-semibold text-neutral-black-50 uppercase tracking-wide">Pedido</p>
            <p className="text-2xl font-bold text-neutral-black-80">#{order.dailyOrderNumber}</p>
            <p className="text-[10px] text-neutral-black-50 font-mono leading-tight mt-0.5 break-all">{order.id}</p>
          </ModalHeader>
        }
      >
        <OrderStatusTimeline status={order.status} timeLapseStatus={order.timeLapseStatus} createdAt={order.createdAt} />

        <div className="flex flex-col divide-y divide-neutral-100">
          <ActionRow
            onClick={handleCopyId}
            iconBg="bg-neutral-100"
            icon={copied
              ? <Check size={15} className="text-green-600" />
              : <Copy size={15} className="text-neutral-black-50" />}
          >
            {copied ? 'ID copiado' : 'Copiar ID de orden'}
          </ActionRow>

          {onOpenKitchenModal && (
            <ActionRow
              onClick={() => { onOpenKitchenModal(); onClose(); }}
              iconBg="bg-violet-50"
              icon={<ChefHat size={15} className="text-violet-600" />}
            >
              Cambiar cocina
            </ActionRow>
          )}

          {paymentChangeMode && onOpenPaymentChange && (
            <ActionRow
              onClick={() => { onOpenPaymentChange(); onClose(); }}
              iconBg="bg-amber-50"
              icon={paymentChangeMode === 'apply'
                ? <CreditCard size={15} className="text-amber-600" />
                : <Send size={15} className="text-amber-600" />}
            >
              <span className="flex flex-col">
                {paymentChangeMode === 'apply' ? 'Cambiar pago' : 'Solicitar cambio de pago'}
                <span className="text-[11px] font-normal text-neutral-black-50">
                  {paymentChangeMode === 'apply'
                    ? 'Método o estado del pago'
                    : 'Método o estado del pago · lo aprueba un admin'}
                </span>
              </span>
            </ActionRow>
          )}

          {onDelete && confirming && (
            <ActionRow
              onClick={() => setConfirming(false)}
              iconBg="bg-neutral-100"
              icon={<X size={15} className="text-neutral-black-50" />}
              className="text-neutral-black-50"
            >
              No cancelar
            </ActionRow>
          )}

          {onDelete && (
            <ActionRow
              onClick={handleDelete}
              disabled={loading}
              iconBg={confirming ? 'bg-red-100' : 'bg-red-50'}
              icon={loading
                ? <Loader2 size={15} className="text-red-500 animate-spin" />
                : <Trash2 size={15} className="text-red-500" />}
              className={confirming ? 'bg-red-50 text-red-600 hover:bg-red-100' : undefined}
            >
              {confirming ? 'Confirmar cancelación' : 'Cancelar orden'}
            </ActionRow>
          )}
        </div>
      </Modal>
    </div>
  );
}
