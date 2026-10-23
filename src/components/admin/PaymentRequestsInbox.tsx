"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, BellRing, Check, ChefHat, Inbox, Loader2, X } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { NavPillItem } from '@/components/navbar/NavPillItem';
import { PAYMENT_LABELS, PAYMENT_STATUS_LABELS, WorkerKitchen } from '@/types/worker';
import { PaymentChangeRequest, PaymentChangeResolution } from '@/types/paymentChangeRequest';
import { formatTime } from '@/lib/dates';

const valueLabel = (request: PaymentChangeRequest, value: string) =>
  (request.type === 'paymentMethod' ? PAYMENT_LABELS[value] : PAYMENT_STATUS_LABELS[value]) ?? value;

interface PaymentRequestsInboxProps {
  /** Para mostrar el nombre de la sede de cada pedido */
  kitchens?: WorkerKitchen[];
  labelClassName?: string;
}

/**
 * Bandeja de admins con las solicitudes de cambio de pago que envía recepción
 * por socket. Aprobar aplica el cambio en el backend (que vuelve a validar el
 * rol); rechazar solo la descarta. En ambos casos se avisa a quien la pidió.
 */
export function PaymentRequestsInbox({ kitchens = [], labelClassName }: PaymentRequestsInboxProps) {
  const { paymentRequests } = useSocket();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const sorted = [...paymentRequests].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <>
      <NavPillItem
        label="Solicitudes"
        Icon={paymentRequests.length > 0 ? BellRing : Inbox}
        onClick={() => setOpen((prev) => !prev)}
        badge={paymentRequests.length > 0 ? paymentRequests.length : undefined}
        isActive={open}
        labelClassName={labelClassName}
      />

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)}>
            <div
              role="dialog"
              aria-label="Solicitudes de cambio de pago"
              onClick={(e) => e.stopPropagation()}
              className="absolute right-4 top-[92px] w-[min(380px,calc(100vw-2rem))] max-h-[calc(100dvh-110px)] flex flex-col bg-white rounded-2xl border border-neutral-black-20 shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-black-10 shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-neutral-black-80">Solicitudes de cambio de pago</h3>
                  <p className="text-[11px] text-neutral-black-50">Enviadas por recepción</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar"
                  className="p-1 rounded-full text-neutral-black-50 hover:bg-neutral-black-5 hover:text-neutral-black-80"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-y-auto p-2 space-y-2">
                {sorted.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-neutral-black-50">
                    <Inbox size={28} className="opacity-40" />
                    <p className="text-xs">No hay solicitudes pendientes</p>
                  </div>
                ) : (
                  sorted.map((request) => (
                    <PaymentRequestItem
                      key={request.id}
                      request={request}
                      kitchenName={kitchens.find((k) => k.id === request.kitchenId)?.name}
                    />
                  ))
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function PaymentRequestItem({ request, kitchenName }: { request: PaymentChangeRequest; kitchenName?: string }) {
  const { resolvePaymentRequest } = useSocket();
  const [loading, setLoading] = useState<PaymentChangeResolution | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResolve = async (resolution: PaymentChangeResolution) => {
    if (loading) return;
    setLoading(resolution);
    setError(null);
    try {
      // Al resolverse, el contexto la saca de la lista y este componente se desmonta
      await resolvePaymentRequest(request.id, resolution);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo resolver la solicitud');
      setLoading(null);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-black-10 p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] text-neutral-black-50">
        <span className="min-w-6 h-6 px-1.5 flex items-center justify-center rounded-full bg-primary-red text-xs font-bold text-white">
          {request.dailyOrderNumber}
        </span>
        <span className="font-semibold text-neutral-black-80">
          {request.type === 'paymentMethod' ? 'Método de pago' : 'Estado del pago'}
        </span>
        {kitchenName && (
          <span className="flex items-center gap-0.5 min-w-0 truncate">
            <ChefHat size={11} className="shrink-0" />
            {kitchenName}
          </span>
        )}
        <span className="ml-auto shrink-0 tabular-nums">{formatTime(request.createdAt)}</span>
      </div>

      <div className="flex items-center gap-2 text-sm font-bold text-neutral-black-80">
        <span className="text-neutral-black-50 line-through decoration-1">{valueLabel(request, request.from)}</span>
        <ArrowRight size={14} className="text-neutral-black-50 shrink-0" />
        <span>{valueLabel(request, request.to)}</span>
      </div>

      <p className="text-xs text-neutral-black-80 bg-neutral-black-5 rounded-lg px-2.5 py-1.5 break-words">
        “{request.reason}”
      </p>
      <p className="text-[11px] text-neutral-black-50">Pidió: {request.requestedBy.name}</p>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => handleResolve('reject')}
          disabled={!!loading}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-neutral-black-20 text-xs font-semibold text-neutral-black-80 hover:bg-neutral-black-5 transition-colors disabled:opacity-50"
        >
          {loading === 'reject' ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
          Rechazar
        </button>
        <button
          type="button"
          onClick={() => handleResolve('approve')}
          disabled={!!loading}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-xs font-semibold text-white transition-colors disabled:opacity-60"
        >
          {loading === 'approve' ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          Aprobar y aplicar
        </button>
      </div>
    </div>
  );
}
