"use client";

import { Modal, ModalHeader } from '@/components/ui/modal';
import { RecepcionOrderCard } from './RecepcionOrderCard';

type CardProps = React.ComponentProps<typeof RecepcionOrderCard>;
type Handlers = 'onStatusChange' | 'onAssignCourier' | 'onAssignKitchen' | 'onDelete';

// En solo lectura (contabilidad) no hace falta pasar los handlers
type RecepcionOrderDetailModalProps = Omit<CardProps, 'compact' | 'onOpenDetail' | Handlers> &
  Partial<Pick<CardProps, Handlers>> & {
    onClose: () => void;
  };

const noop = async () => {};

/**
 * Detalle de una orden: muestra la card completa de recepción (dirección, comentario,
 * productos, desglose, pago, acciones). Lo usan la vista simple de recepción y,
 * con `readOnly`, contabilidad.
 *
 * Todo lo que abre la card (menú de orden, cocina, pago, domiciliarios) es Radix
 * y se apila sobre este modal.
 */
export const RecepcionOrderDetailModal: React.FC<RecepcionOrderDetailModalProps> = ({
  onClose,
  onStatusChange = noop,
  onAssignCourier = noop,
  onAssignKitchen = noop,
  onDelete = noop,
  ...cardProps
}) => {
  const label = `Orden #${cardProps.order.dailyOrderNumber}`;

  return (
    // `contents`: el wrapper no afecta el layout; frena que los clics suban a la fila clicable que abre el detalle
    <div className="contents" onClick={(e) => e.stopPropagation()}>
      <Modal
        open
        onOpenChange={(open) => { if (!open) onClose(); }}
        size="sm"
        ariaLabel={label}
        bodyClassName="p-3 sm:p-3"
        customHeader={
          <ModalHeader className="pb-2 pr-14">
            <p className="text-lg font-bold text-neutral-black-80">{label}</p>
          </ModalHeader>
        }
      >
        <RecepcionOrderCard
          {...cardProps}
          onStatusChange={onStatusChange}
          onAssignCourier={onAssignCourier}
          onAssignKitchen={onAssignKitchen}
          onDelete={onDelete}
        />
      </Modal>
    </div>
  );
};
