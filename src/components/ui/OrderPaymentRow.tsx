'use client';

import { useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import { Check, ChevronDown, Clock, CreditCard, Loader2 } from 'lucide-react';
import bancolombiaLogo from "@/media/img/bancolombia.png";
import nequiLogo from "@/media/img/nequi.png";
import efectivoLogo from "@/media/img/efectivo.jpeg";
import { PAYMENT_LABELS } from '@/types/worker';
import { formatCOP } from '@/components/ui/OrderItemsList';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types/orders';

const COLOMBIAN_BILLS = [1_000, 2_000, 5_000, 10_000, 20_000, 50_000, 100_000, 200_000];

export function getCashChange(total: number): { bill: number; change: number } | null {
  const bill = COLOMBIAN_BILLS.find((b) => b > total);
  if (!bill) return null;
  return { bill, change: bill - total };
}

const PAYMENT_LOGOS: Record<string, { src: StaticImageData; alt: string }> = {
  cash: { src: efectivoLogo, alt: 'Efectivo' },
  bancolombia: { src: bancolombiaLogo, alt: 'Bancolombia' },
  nequi: { src: nequiLogo, alt: 'Nequi' },
};

const PAYMENT_ACTIVE_COLORS: Record<string, string> = {
  cash: 'bg-green-600 text-white',
  bancolombia: 'bg-neutral-black-80 text-white',
  nequi: 'bg-[#da0081] text-white',
};

const PAYMENT_HOVER_COLORS: Record<string, string> = {
  cash: 'hover:bg-green-100 hover:text-green-700 focus:bg-green-100 focus:text-green-700',
  bancolombia: 'hover:bg-neutral-black-10 hover:text-neutral-black-80 focus:bg-neutral-black-10 focus:text-neutral-black-80',
  nequi: 'hover:bg-[#fce4f3] hover:text-[#da0081] focus:bg-[#fce4f3] focus:text-[#da0081]',
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
  /**
   * Compacto (recepción): solo método + botón "Aprobar", sin total ni vueltas
   * (la card de recepción las muestra junto al total).
   * El selector de método se abre al tocar el método.
   */
  compact?: boolean;
  onPaymentMethodChange?: (method: string) => Promise<void>;
  onMarkPaid?: () => Promise<void>;
  /** Revertir un pago ya confirmado a "pendiente". Reservado para overrides de admin. */
  onMarkPending?: () => Promise<void>;
}

export function OrderPaymentRow({
  paymentMethod,
  paid = false,
  total = 0,
  withBorderTop = false,
  muted = false,
  className,
  recepcionMode = false,
  compact = false,
  onPaymentMethodChange,
  onMarkPaid,
  onMarkPending,
}: OrderPaymentRowProps) {
  const [showPicker, setShowPicker] = useState(!compact);
  const [confirmingPaid, setConfirmingPaid] = useState(false);
  const [loadingMethod, setLoadingMethod] = useState<string | null>(null);
  const [loadingPaid, setLoadingPaid] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);

  const currentLogo = PAYMENT_LOGOS[paymentMethod];
  const cashChange =
    paymentMethod === 'cash' &&
      total > 0 ? getCashChange(total) : null

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
    } finally {
      setLoadingMethod(null);
    }
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

  const handleMarkPending = async () => {
    if (!onMarkPending || loadingPending) return;
    setLoadingPending(true);
    try {
      await onMarkPending();
    } finally {
      setLoadingPending(false);
    }
  };

  const isLoading = !!loadingMethod || loadingPaid || loadingPending;

  if (compact) {
    return (
      <div className={cn('relative space-y-1.5', className)}>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-[1px]">
            <Loader2 size={16} className="text-neutral-black-100 animate-spin" />
          </div>
        )}

        {/* Método + aprobar */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleMethodAreaClick}
            disabled={!canChangeMethod}
            className={cn(
              'flex-1 min-w-0 flex items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors',
              canChangeMethod
                ? 'border-neutral-black-20 bg-white hover:bg-neutral-black-5 cursor-pointer'
                : 'border-transparent cursor-default',
            )}
          >
            {currentLogo ? (
              <Image src={currentLogo.src} alt={currentLogo.alt} width={16} height={16} className="object-contain rounded-sm shrink-0" />
            ) : (
              <CreditCard size={14} className="text-neutral-black-100 shrink-0" />
            )}
            <span className="text-xs font-semibold text-neutral-black-80 truncate">
              {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
            </span>
            {canChangeMethod && (
              <ChevronDown
                size={12}
                className={cn('ml-auto text-neutral-black-100 shrink-0 transition-transform', showPicker && 'rotate-180')}
              />
            )}
          </button>

          {paid ? (
            <span className="flex items-center gap-1 rounded-lg bg-green-100 px-2 py-1.5 text-xs font-semibold text-green-700 shrink-0">
              <Check size={12} />
              Pagado
            </span>
          ) : canMarkPaid && !confirmingPaid && (
            <button
              type="button"
              onClick={() => setConfirmingPaid(true)}
              className="rounded-lg border border-green-500 px-2 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 transition-colors shrink-0"
            >
              Aprobar
            </button>
          )}
        </div>

        {/* Confirmación de pago */}
        {confirmingPaid && (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setConfirmingPaid(false)}
              disabled={loadingPaid}
              className="flex-1 py-1.5 rounded-lg bg-neutral-black-5 text-neutral-black-100 text-xs font-semibold hover:bg-neutral-black-10 transition-colors disabled:opacity-50"
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
              Aprobar pago
            </button>
          </div>
        )}

        {/* Selector de método */}
        {showPicker && canChangeMethod && (
          <div className="grid grid-cols-3 gap-1">
            {PAYMENT_METHODS.map((method) => {
              const logo = PAYMENT_LOGOS[method];
              const isActive = method === paymentMethod;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => handleMethodSelect(method)}
                  disabled={!!loadingMethod}
                  title={PAYMENT_LABELS[method]}
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-medium transition-all disabled:opacity-50',
                    isActive
                      ? PAYMENT_ACTIVE_COLORS[method] ?? 'bg-neutral-black-80 text-white'
                      : cn('bg-neutral-black-5 text-neutral-black-100', PAYMENT_HOVER_COLORS[method]),
                  )}
                >
                  {loadingMethod === method ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : logo ? (
                    <Image src={logo.src} alt={logo.alt} width={14} height={14} className="object-contain rounded-sm" />
                  ) : (
                    <CreditCard size={14} />
                  )}
                  <span className="truncate max-w-full px-0.5">{PAYMENT_LABELS[method]}</span>
                </button>
              );
            })}
          </div>
        )}

      </div>
    );
  }

  return (
    <div className={cn('relative', withBorderTop && 'border-t border-neutral-black-10 pt-2', className)}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-[1px]">
          <Loader2 size={18} className="text-neutral-black-100 animate-spin" />
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
          {currentLogo ? (
            <Image src={currentLogo.src} alt={currentLogo.alt} width={22} height={22} className="object-contain rounded-sm shrink-0" />
          ) : (
            <CreditCard size={18} className="text-neutral-black-100 shrink-0" />
          )}
          <span
            className={cn(
              'text-base font-bold',
              muted ? 'text-neutral-black-100' : 'text-neutral-black-80',
            )}
          >
            {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
          </span>
        </button>

        {/* Precio */}
        <span
          className={cn(
            'text-lg font-bold transition-colors px-1',
            paid ? 'line-through text-green-500' : 'text-neutral-black-80',
          )}
        >
          {formatCOP(total)}
        </span>
      </div>

      {cashChange && !paid && (
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-sm text-neutral-black-100">Con {formatCOP(cashChange.bill)}</span>
          <span className="text-sm font-semibold text-amber-600">Devolver {formatCOP(cashChange.change)}</span>
        </div>
      )}

      {/* Botón discreto para marcar pago — siempre visible */}
      {canMarkPaid && !confirmingPaid && (
        <button
          type="button"
          onClick={() => setConfirmingPaid(true)}
          className="w-full mt-2 py-1 rounded-lg border border-neutral-black-10 text-xs text-neutral-black-100 hover:border-neutral-black-20 hover:text-neutral-black-60 transition-colors"
        >
          Confirmar pago
        </button>
      )}

      {/* Revertir pago ya confirmado — override de admin */}
      {paid && onMarkPending && (
        <button
          type="button"
          onClick={handleMarkPending}
          disabled={loadingPending}
          className="w-full mt-2 flex items-center justify-center gap-1.5 py-1 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-60"
        >
          {loadingPending ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
          Marcar pago como pendiente
        </button>
      )}

      {/* Confirmación de pago */}
      {confirmingPaid && (
        <div className="flex gap-1.5 mt-2">
          <button
            type="button"
            onClick={() => setConfirmingPaid(false)}
            disabled={loadingPaid}
            className="flex-1 py-1.5 rounded-lg bg-neutral-black-5 text-neutral-black-100 text-xs font-semibold hover:bg-neutral-black-10 transition-colors disabled:opacity-50"
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
            const logo = PAYMENT_LOGOS[method];
            const isActive = method === paymentMethod;
            const isLoading = loadingMethod === method;
            return (
              <button
                key={method}
                type="button"
                onClick={() => handleMethodSelect(method)}
                disabled={!!loadingMethod}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all flex-1 justify-center disabled:opacity-50',
                  isActive
                    ? PAYMENT_ACTIVE_COLORS[method] ?? 'bg-neutral-black-80 text-white'
                    : cn('bg-neutral-black-5 text-neutral-black-100', PAYMENT_HOVER_COLORS[method]),
                )}
              >
                {isLoading ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : logo ? (
                  <Image src={logo.src} alt={logo.alt} width={14} height={14} className="object-contain rounded-sm" />
                ) : (
                  <CreditCard size={11} />
                )}
                <span>{PAYMENT_LABELS[method]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
