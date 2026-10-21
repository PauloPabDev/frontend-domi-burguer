"use client";

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { RecepcionOrderCard } from './RecepcionOrderCard';

type RecepcionOrderDetailModalProps = Omit<React.ComponentProps<typeof RecepcionOrderCard>, 'compact' | 'onOpenDetail'> & {
  onClose: () => void;
};

/**
 * Detalle de una orden desde la vista simple: muestra la card completa de
 * recepción (dirección, comentario, productos, desglose, pago, acciones).
 * z-[45]: por encima del nav (z-40) y por debajo de los popovers de la card
 * (domiciliario z-50, menú de la orden z-[500]), que se abren desde aquí.
 */
export const RecepcionOrderDetailModal: React.FC<RecepcionOrderDetailModalProps> = ({ onClose, ...cardProps }) => {
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
        aria-label={`Orden #${cardProps.order.dailyOrderNumber}`}
        className="w-full max-w-[360px] max-h-[calc(100dvh-2rem)] flex flex-col gap-2"
      >
        {/* Cerrar fuera de la card para no tapar la hora de la fila superior */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="self-end shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-neutral-black-20 text-neutral-black-80 hover:text-primary-red transition-colors"
        >
          <X size={16} />
        </button>
        <div className="min-h-0 overflow-y-auto rounded-[20px]">
          <RecepcionOrderCard {...cardProps} />
        </div>
      </div>
    </div>,
    document.body
  );
};
