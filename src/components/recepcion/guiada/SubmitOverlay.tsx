"use client";

import { Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface SubmitOverlayProps {
  isSubmitting: boolean;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}

export function SubmitOverlay({ isSubmitting, error, onRetry, onClose }: SubmitOverlayProps) {
  if (!isSubmitting && !error) return null;

  return (
    // `contents`: no afecta el layout; frena que los clics del modal suban a ancestros clicables
    <div className="contents" onClick={(e) => e.stopPropagation()}>
      <Modal
        open
        // mientras se envía no se puede cerrar (Esc, fuera, X o arrastre): solo tras un error
        onOpenChange={(open) => { if (!open && !isSubmitting) onClose(); }}
        size="sm"
        ariaLabel={isSubmitting ? 'Creando orden' : 'Error al crear la orden'}
        hideCloseButton={isSubmitting}
        closeOnOutsideClick={!isSubmitting}
        enableDragToDismiss={!isSubmitting}
        footer={
          !isSubmitting && (
            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={onClose} className="flex-1 h-11">
                Cerrar
              </Button>
              <Button onClick={onRetry} className="flex-1 h-11 font-bold">
                Reintentar
              </Button>
            </div>
          )
        }
      >
        <div className="flex flex-col items-center gap-5 py-2">
          {isSubmitting ? (
            <>
              <div className="w-20 h-20 rounded-full bg-primary-red/10 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-red animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-bold text-neutral-black-80 text-xl">Creando orden...</p>
                <p className="text-sm text-neutral-black-80/70 mt-1">Por favor espera un momento</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <div className="text-center">
                <p className="font-bold text-neutral-black-80 text-xl">Error al crear la orden</p>
                <p className="text-sm text-primary-red-100 mt-2">{error}</p>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
