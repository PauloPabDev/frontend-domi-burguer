'use client';

import { useState } from 'react';
import { Banknote, Building2, Smartphone, CreditCard, Loader2 } from 'lucide-react';
import { PAYMENT_LABELS } from '@/types/worker';
import { formatCOP } from '@/components/ui/OrderItemsList';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types/orders';

const COLOMBIAN_BILLS = [1_000, 2_000, 5_000, 10_000, 20_000, 50_000, 100_000, 200_000];

function getCashChange(total: number): { bill: number; change: number } | null {
  const bill = COLOMBIAN_BILLS.find((b) => b > total);
  if (!bill) return null;
  return { bill, change: bill - total };
}

const PAYMENT_ICONS: Record<string, React.ElementType> = {
  cash: Banknote,
  bancolombia: Building2,
  nequi: Smartphone,
};

const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'bancolombia', 'nequi'];

interface OrderPaymentRowProps {
  paymentMethod: string;
  paid?: boolean;
  total?: number;
  withBorderTop?: boolean;
  muted?: boolean;
  className?: string;
  recepcionMode?: boolean;
  onPaymentMethodChange?: (method: string) => Promise<void>;
  onMarkPaid?: () => Promise<void>;
}

export function OrderPaymentRow({
  paymentMethod,
  paid = false,
  total = 0,
  withBorderTop = false,
  muted = false,
  className,
  recepcionMode = false,
  onPaymentMethodChange,
  onMarkPaid,
}: OrderPaymentRowProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [confirmingPaid, setConfirmingPaid] = useState(false);
  const [loadingMethod, setLoadingMethod] = useState<string | null>(null);
  const [loadingPaid, setLoadingPaid] = useState(false);

  const Icon = PAYMENT_ICONS[paymentMethod] ?? CreditCard;
  const cashChange = paymentMethod === 'cash' && total > 0 ? getCashChange(total) : null;

  const canChangeMethod = recepcionMode && !!onPaymentMethodChange && !paid;
  const canMarkPaid = recepcionMode && !!onMarkPaid && !paid;

  const handleMethodAreaClick = () => {
    if (!canChangeMethod) return;
    setShowPicker((prev) => !prev);
  };

  const handleMethodSelect = async (method: string) => {
    if (!onPaymentMethodChange || method === paymentMethod || loadingMethod) return;
    setLoadingMethod(method);
    try {
      await onPaymentMethodChange(method);
      setShowPicker(false);
    } finally {
      setLoadingMethod(null);
    }
  };

  const handlePriceClick = () => {
    if (!canMarkPaid) return;
    setConfirmingPaid(true);
  };

  const handleConfirmPaid = async () => {
    setLoadingPaid(true);
    try {
      await onMarkPaid!();
      setConfirmingPaid(false);
    } finally {
      setLoadingPaid(false);
    }
  };

  const isLoading = !!loadingMethod || loadingPaid;

  return (
    <div className={cn('relative', withBorderTop && 'border-t border-neutral-black-10 pt-2', className)}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-[1px]">
          <Loader2 size={18} className="text-neutral-black-50 animate-spin" />
        </div>
      )}
      <div className="flex items-center justify-between">
        {/* Método de pago — clic para abrir selector */}
        <button
          type="button"
          onClick={handleMethodAreaClick}
          disabled={!canChangeMethod}
          className={cn(
            'flex items-center gap-2 rounded-lg transition-colors',
            canChangeMethod
              ? 'cursor-pointer hover:bg-neutral-black-5 -mx-1 px-1 py-0.5'
              : 'cursor-default',
          )}
        >
          <Icon size={16} className="text-neutral-black-50 shrink-0" />
          <span
            className={cn(
              'text-sm font-medium',
              muted ? 'text-neutral-black-50' : 'text-neutral-black-80',
            )}
          >
            {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
          </span>
        </button>

        {/* Precio — clic para recibir pago */}
        <button
          type="button"
          onClick={handlePriceClick}
          disabled={!canMarkPaid}
          className={cn(
            'flex items-center gap-1 rounded-lg px-1 py-0.5 transition-colors',
            canMarkPaid
              ? 'cursor-pointer hover:bg-green-50'
              : 'cursor-default',
          )}
        >
          <span
            className={cn(
              'text-base font-bold transition-colors',
              paid
                ? 'line-through text-green-500'
                : canMarkPaid
                  ? 'text-neutral-black-80 hover:text-green-600'
                  : 'text-neutral-black-80',
            )}
          >
            {formatCOP(total)}
          </span>
        </button>
      </div>

      {cashChange && (
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-sm text-neutral-black-50">Con {formatCOP(cashChange.bill)}</span>
          <span className="text-sm font-semibold text-amber-600">Devolver {formatCOP(cashChange.change)}</span>
        </div>
      )}

      {/* Confirmación de pago */}
      {confirmingPaid && (
        <div className="flex gap-1.5 mt-2">
          <button
            type="button"
            onClick={() => setConfirmingPaid(false)}
            disabled={loadingPaid}
            className="flex-1 py-1.5 rounded-lg bg-neutral-black-5 text-neutral-black-50 text-xs font-semibold hover:bg-neutral-black-10 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmPaid}
            disabled={loadingPaid}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors disabled:opacity-60"
          >
            {loadingPaid && <Loader2 size={12} className="animate-spin" />}
            {loadingPaid ? 'Registrando...' : 'Confirmar'}
          </button>
        </div>
      )}

      {/* Selector de método — visible al hacer clic en el método */}
      {showPicker && (
        <div className="flex gap-1 mt-2">
          {PAYMENT_METHODS.map((method) => {
            const MethodIcon = PAYMENT_ICONS[method] ?? CreditCard;
            const isActive = method === paymentMethod;
            const isLoading = loadingMethod === method;
            return (
              <button
                key={method}
                type="button"
                onClick={() => handleMethodSelect(method)}
                disabled={!!loadingMethod}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all flex-1 justify-center disabled:opacity-50',
                  isActive
                    ? 'bg-neutral-black-80 text-white'
                    : 'bg-neutral-black-5 text-neutral-black-50 hover:bg-neutral-black-10',
                )}
              >
                {isLoading
                  ? <Loader2 size={11} className="animate-spin" />
                  : <MethodIcon size={11} />}
                <span>{PAYMENT_LABELS[method]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
