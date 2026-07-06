"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OrderActionButtonsProps {
  label: string;
  variant?: 'primary' | 'dark';
  size?: 'sm' | 'md';
  /** Cocina: botones a ancho completo */
  fullWidth?: boolean;
  onConfirm: () => Promise<void>;
  /** Courier: el card es clickable, detiene propagación en todos los clicks */
  stopPropagation?: boolean;
  /** Recibe true/false cada vez que cambia el estado de confirmación */
  onConfirmingChange?: (confirming: boolean) => void;
  className?: string;
}

export function OrderActionButtons({
  label,
  variant = 'primary',
  size = 'sm',
  fullWidth = false,
  onConfirm,
  stopPropagation = false,
  onConfirmingChange,
  className,
}: OrderActionButtonsProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const stop = (e: React.MouseEvent) => { if (stopPropagation) e.stopPropagation(); };

  const setConfirmingState = (value: boolean) => {
    setConfirming(value);
    onConfirmingChange?.(value);
  };

  const handleConfirm = async (e: React.MouseEvent) => {
    stop(e);
    setLoading(true);
    try {
      await onConfirm();
      setConfirmingState(false);
    } finally {
      setLoading(false);
    }
  };

  if (confirming) {
    return (
      <div
        className={cn('flex items-center gap-2', className)}
        onClick={stop}
      >
        <button
          onClick={(e) => { stop(e); setConfirmingState(false); }}
          disabled={loading}
          className={cn(
            'text-xs font-medium text-neutral-black-50 hover:text-neutral-black-80 border border-neutral-black-20 rounded-xl transition-colors disabled:opacity-40',
            fullWidth ? 'flex-1 py-2.5' : 'px-3 py-1.5',
          )}
        >
          Cancelar
        </button>
        <div className={cn(fullWidth && 'flex-1')}>
          <Button
            onClick={handleConfirm}
            loading={loading}
            loadingText={fullWidth ? 'Actualizando...' : '...'}
            size={size}
            variant={variant}
            fullWidth={fullWidth}
          >
            Confirmar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={(e) => { stop(e); setConfirmingState(true); }}
      size={size}
      variant={variant}
      fullWidth={fullWidth}
      className={className}
    >
      {label}
    </Button>
  );
}
