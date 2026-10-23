"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Check, Clock, CreditCard, Send, X, XCircle, type LucideIcon } from 'lucide-react';
import { WorkerOrder, PAYMENT_LABELS, PAYMENT_STATUS_LABELS } from '@/types/worker';
import { PaymentMethod, PaymentStatus } from '@/types/orders';
import { PaymentChangeRequestInput, PaymentChangeType } from '@/types/paymentChangeRequest';
import { PAYMENT_LOGOS, PAYMENT_METHODS } from '@/components/ui/OrderPaymentRow';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PAYMENT_STATUSES: PaymentStatus[] = ['approved', 'pending', 'failed'];

const STATUS_STYLES: Record<PaymentStatus, { Icon: LucideIcon; active: string; icon: string }> = {
  approved: { Icon: Check, active: 'border-green-500 bg-green-50 text-green-700', icon: 'text-green-600' },
  pending: { Icon: Clock, active: 'border-amber-500 bg-amber-50 text-amber-700', icon: 'text-amber-600' },
  failed: { Icon: XCircle, active: 'border-red-500 bg-red-50 text-red-700', icon: 'text-red-600' },
};

const REASON_MIN = 3;
const REASON_MAX = 200;

interface PaymentChangeModalProps {
  order: WorkerOrder;
  /** apply: un admin cambia el pago directamente · request: recepción le pide el cambio a un admin */
  mode: 'apply' | 'request';
  /** En modo apply el motivo va vacío */
  onSubmit: (change: PaymentChangeRequestInput) => Promise<void>;
  onClose: () => void;
}

/**
 * Cambio del método o del estado del pago de una orden. El mismo formulario sirve
 * para que un admin aplique el cambio y para que recepción lo solicite (con motivo).
 * z-[510]: por encima del menú de la orden y del detalle de admin (z-[500]).
 */
export function PaymentChangeModal({ order, mode, onSubmit, onClose }: PaymentChangeModalProps) {
  const isRequest = mode === 'request';
  const currentMethod = order.paymentMethod;
  const currentStatus: PaymentStatus = order.payment?.status ?? 'pending';

  const [type, setType] = useState<PaymentChangeType>('paymentMethod');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, loading]);

  const selected = type === 'paymentMethod' ? method : status;
  const trimmedReason = reason.trim();
  const reasonValid = !isRequest || trimmedReason.length >= REASON_MIN;
  const canSubmit = !!selected && reasonValid && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const change =
        type === 'paymentMethod'
          ? { type: 'paymentMethod' as const, value: method as PaymentMethod }
          : { type: 'paymentStatus' as const, value: status as PaymentStatus };
      await onSubmit({ ...change, reason: isRequest ? trimmedReason : '' });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar el cambio');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { key: PaymentChangeType; label: string; current: string }[] = [
    { key: 'paymentMethod', label: 'Método de pago', current: PAYMENT_LABELS[currentMethod] ?? currentMethod },
    { key: 'paymentStatus', label: 'Estado del pago', current: PAYMENT_STATUS_LABELS[currentStatus] ?? currentStatus },
  ];
  const activeTab = tabs.find((t) => t.key === type)!;

  return createPortal(
    <div
      className="fixed inset-0 z-[510] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isRequest ? 'Solicitar cambio de pago' : 'Cambiar pago'}
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-black-10">
          <div className="flex items-center gap-2 min-w-0">
            {isRequest ? (
              <Send size={16} className="text-primary-red shrink-0" />
            ) : (
              <CreditCard size={16} className="text-primary-red shrink-0" />
            )}
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-neutral-black-80">
                {isRequest ? 'Solicitar cambio de pago' : 'Cambiar pago'}
              </h3>
              <p className="text-[11px] text-neutral-black-50">Pedido #{order.dailyOrderNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
            className="p-1 text-neutral-black-50 hover:text-neutral-black-80 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Qué se cambia */}
          <div role="tablist" className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-neutral-black-5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={type === tab.key}
                onClick={() => { setType(tab.key); setError(null); }}
                className={cn(
                  'py-1.5 rounded-lg text-xs font-semibold transition-colors',
                  type === tab.key
                    ? 'bg-white text-neutral-black-80 shadow-sm'
                    : 'text-neutral-black-50 hover:text-neutral-black-80'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-neutral-black-50">
            Actual: <span className="font-semibold text-neutral-black-80">{activeTab.current}</span>
          </p>

          {/* Nuevo valor (el actual no se puede elegir) */}
          {type === 'paymentMethod' ? (
            <div className="grid grid-cols-3 gap-1.5">
              {PAYMENT_METHODS.map((m) => {
                const logo = PAYMENT_LOGOS[m];
                const isCurrent = m === currentMethod;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    disabled={isCurrent || loading}
                    aria-pressed={method === m}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border-[1.5px] py-2.5 text-xs font-semibold transition-colors',
                      method === m
                        ? 'border-primary-red bg-primary-red/5 text-neutral-black-80'
                        : 'border-neutral-black-10 text-neutral-black-80 hover:border-neutral-black-30',
                      isCurrent && 'opacity-40 cursor-not-allowed hover:border-neutral-black-10'
                    )}
                  >
                    {logo ? (
                      <Image src={logo.src} alt={logo.alt} width={20} height={20} className="object-contain rounded-sm" />
                    ) : (
                      <CreditCard size={18} />
                    )}
                    {PAYMENT_LABELS[m]}
                    {isCurrent && <span className="text-[10px] font-medium text-neutral-black-50 -mt-0.5">actual</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {PAYMENT_STATUSES.map((s) => {
                const { Icon, active, icon } = STATUS_STYLES[s];
                const isCurrent = s === currentStatus;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    disabled={isCurrent || loading}
                    aria-pressed={status === s}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border-[1.5px] py-2.5 text-xs font-semibold transition-colors',
                      status === s ? active : 'border-neutral-black-10 text-neutral-black-80 hover:border-neutral-black-30',
                      isCurrent && 'opacity-40 cursor-not-allowed hover:border-neutral-black-10'
                    )}
                  >
                    <Icon size={18} className={icon} />
                    {PAYMENT_STATUS_LABELS[s]}
                    {isCurrent && <span className="text-[10px] font-medium text-neutral-black-50 -mt-0.5">actual</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Motivo: solo al solicitar, para que el admin sepa por qué */}
          {isRequest && (
            <div className="space-y-1">
              <label htmlFor="payment-change-reason" className="text-xs font-semibold text-neutral-black-80">
                Motivo
              </label>
              <textarea
                id="payment-change-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value.slice(0, REASON_MAX))}
                disabled={loading}
                rows={2}
                placeholder="Ej.: el cliente pagó por Nequi y no en efectivo"
                className="w-full resize-none rounded-xl border border-neutral-black-20 px-3 py-2 text-sm text-neutral-black-80 placeholder:text-neutral-black-40 focus:outline-none focus:border-neutral-black-50"
              />
              <p className="text-[10px] text-neutral-black-50 text-right tabular-nums">
                {reason.length}/{REASON_MAX}
              </p>
            </div>
          )}

          {isRequest && (
            <p className="text-[11px] text-neutral-black-50 leading-snug">
              Un administrador revisará la solicitud. Te llegará un aviso cuando la apruebe o la rechace.
            </p>
          )}

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="px-4 pb-4">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={loading}
            loadingText={isRequest ? 'Enviando...' : 'Aplicando...'}
            fullWidth
            variant="primary"
          >
            {isRequest ? 'Enviar solicitud' : 'Aplicar cambio'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
