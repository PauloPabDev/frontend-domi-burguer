"use client";

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { WorkerKitchen, WorkerOrder } from '@/types/worker';
import { RecepcionOrderCard } from './RecepcionOrderCard';

interface ContabilidadOrderDetailModalProps {
  order: WorkerOrder;
  kitchens: WorkerKitchen[];
  onClose: () => void;
}

const noop = async () => {};

/** Card de la orden de venta en solo lectura, para consultarla desde contabilidad. */
export function ContabilidadOrderDetailModal({ order, kitchens, onClose }: ContabilidadOrderDetailModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[45] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Orden #${order.dailyOrderNumber}`}
        className="w-full max-w-[360px] max-h-[calc(100dvh-2rem)] flex flex-col gap-2"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="self-end shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-neutral-black-20 text-neutral-black-80 hover:text-primary-red transition-colors"
        >
          <X size={16} />
        </button>
        <div className="min-h-0 overflow-y-auto rounded-[20px]">
          <RecepcionOrderCard
            order={order}
            kitchens={kitchens}
            readOnly
            onStatusChange={noop}
            onAssignCourier={noop}
            onAssignKitchen={noop}
            onDelete={noop}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
