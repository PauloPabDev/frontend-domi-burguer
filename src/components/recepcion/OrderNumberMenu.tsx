'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChefHat, Copy, Check, Trash2, Loader2, X } from 'lucide-react';
import { WorkerOrder } from '@/types/worker';
import { OrderStatusTimeline } from '@/components/ui/OrderStatusTimeline';
import { cn } from '@/lib/utils';

export interface OrderNumberMenuProps {
  order: WorkerOrder;
  onClose: () => void;
  onOpenKitchenModal: () => void;
  onDelete: () => Promise<void>;
}

export function OrderNumberMenu({ order, onClose, onOpenKitchenModal, onDelete }: OrderNumberMenuProps) {
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
        className="relative z-10 w-[580px] bg-white rounded-2xl shadow-xl overflow-hidden"
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

        {/* Timeline */}
        <OrderStatusTimeline status={order.status} timeLapseStatus={order.timeLapseStatus} />

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
