"use client";

import { ConfirmModal } from "@/components/ui/modal";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  rewardCode?: string;
}

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  rewardCode,
}: ConfirmDeleteModalProps) => {
  const message = rewardCode
    ? `Eliminar este premio también eliminará el código "${rewardCode}" de tu pedido.`
    : "¿Seguro que no quieres pensarlo dos veces?";

  return (
    <ConfirmModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="¿ELIMINAR ESTE PRODUCTO DEL PEDIDO?"
      message={message}
      cancelText="NO, DÉJALO"
      confirmText="SI, ELIMINAR"
      onConfirm={onConfirm}
    />
  );
};
