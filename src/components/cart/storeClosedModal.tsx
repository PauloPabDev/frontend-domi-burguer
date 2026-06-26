"use client";

import { Clock } from "lucide-react";
import { AlertModal } from "@/components/ui/modal";

interface StoreClosedModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  opensAt?: string;
}

export const StoreClosedModal = ({
  isOpen,
  onClose,
  message,
  opensAt,
}: StoreClosedModalProps) => {
  return (
    <AlertModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      type="warning"
      title="¡Lo sentimos!"
      headerIcon={<Clock className="w-8 h-8 text-accent-yellow-80" />}
      message={message}
      confirmText="ENTENDIDO"
      ariaLabel="tienda-cerrada"
    >
      {opensAt && (
        <p className="text-center text-neutral-black-60 mt-2">Abrimos {opensAt}</p>
      )}

      <div className="mt-4 p-3 bg-accent-yellow-10 rounded-lg text-center">
        <p className="text-sm font-bold text-neutral-black-80">Horario de atención:</p>
        <p className="text-sm text-neutral-black-60">Lunes a Sábado: 4:30 PM - 10:00 PM</p>
        <p className="text-sm text-neutral-black-60">Domingos: Cerrado</p>
      </div>
    </AlertModal>
  );
};
