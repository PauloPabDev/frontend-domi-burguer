"use client";

import { Modal } from "@/components/ui/modal";
import { LoginSection } from "./loginSection";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const LogInModal = ({ isOpen, onClose, title }: ModalProps) => {
  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      size="xl"
      footer={false}
      hideCloseButton
      ariaLabel="Iniciar sesión"
      contentClassName="h-[600px]"
      bodyClassName="p-4 lg:p-6"
    >
      <LoginSection onClose={onClose} title={title} />
    </Modal>
  );
};
