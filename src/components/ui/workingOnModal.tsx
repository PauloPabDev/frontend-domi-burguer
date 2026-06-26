"use client";

import Image from "next/image";
import { Modal } from "@/components/ui/modal";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkingOnModal = ({ isOpen, onClose }: ModalProps) => {
  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="PRÓXIMAMENTE"
      size="lg"
      footer={{
        confirm: {
          label: "CERRAR",
          variant: "ghost",
          onClick: onClose,
          className: "bg-accent-yellow-40 hover:bg-accent-yellow-60 text-neutral-black-80",
        },
        cancel: false,
        alignment: "center",
      }}
    >
      <div className="flex flex-col gap-4">
        <p className="text-neutral-600">
          Próximamente podrás registrarte para que tus pedidos sean más fácil y elegir desde qué cocina quieres que salga tu pedido.
        </p>
        <p className="text-neutral-600">
          Actualmente contamos con 2 sedes en el área metropolitana:
        </p>
        <div className="text-neutral-600 space-y-2">
          <a
            href="https://maps.app.goo.gl/CmTjewV63uy2SdDb9"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:text-primary-red transition-colors"
          >
            <strong>📍 Sede Norte:</strong><br />
            Barrio Pedregal – Tv. 103A #74A-94 (Cerca de Comfama Pedregal)
          </a>
          <a
            href="https://maps.app.goo.gl/8uqEf6W9qg5yp62AA"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:text-primary-red transition-colors"
          >
            <strong>📍 Sede Sur:</strong><br />
            Itagüí – Cl. 84A #52D-53 (Cerca del Parque Chimeneas)
          </a>
        </div>
        <div className="flex justify-center">
          <Image
            src="/images/misc/working-cat.webp"
            alt="Gato trabajando"
            className="w-[200px] h-[200px] md:w-[250px] md:h-[250px] object-contain"
            width={500}
            height={492}
            sizes="(max-width: 767px) 200px, 250px"
          />
        </div>
      </div>
    </Modal>
  );
};
