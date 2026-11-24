"use client";

import Link from 'next/link';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Modal, ModalHeader } from '@/components/ui/modal';
import { formatDateTime } from '@/lib/dates';
import { AdminOrderPanel } from './AdminOrderPanel';

type AdminOrderDetailModalProps = React.ComponentProps<typeof AdminOrderPanel>;

/** Modal del panel de administración de una orden; el contenido vive en AdminOrderPanel (también usado por /admin/ordenes/[id]) */
export function AdminOrderDetailModal(props: AdminOrderDetailModalProps) {
  const { order, onClose } = props;

  return (
    // `contents`: el wrapper no afecta el layout; frena que los clics suban a la fila clicable que abre el detalle
    <div className="contents" onClick={(e) => e.stopPropagation()}>
      <Modal
        open
        onOpenChange={(open) => { if (!open) onClose(); }}
        size="lg"
        ariaLabel={`Pedido #${order.dailyOrderNumber}`}
        bodyClassName="p-0 sm:p-0"
        customHeader={
          <ModalHeader className="pb-3 pr-14 border-b border-neutral-100">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck size={16} className="text-primary-red shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-neutral-black-50 uppercase tracking-wide">
                  Pedido · {formatDateTime(order.createdAt)}
                </p>
                <p className="text-2xl font-bold text-neutral-black-80 leading-none">#{order.dailyOrderNumber}</p>
              </div>
              <Link
                href={`/admin/ordenes/${order.id}`}
                title="Abrir en su propia página"
                aria-label="Abrir la orden en su propia página"
                className="ml-auto p-1.5 rounded-full text-neutral-black-50 hover:text-primary-red hover:bg-neutral-black-10 transition-colors"
              >
                <ExternalLink size={16} />
              </Link>
            </div>
          </ModalHeader>
        }
      >
        <AdminOrderPanel {...props} />
      </Modal>
    </div>
  );
}
