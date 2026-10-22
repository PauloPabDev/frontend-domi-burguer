"use client";

import { useState } from 'react';
import { Check, X } from 'lucide-react';
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
  /** Clases extra para cada botón (p. ej. radio de borde) */
  buttonClassName?: string;
  /** Modo circular: solo el ícono (el label queda como tooltip) y la confirmación también en círculos */
  icon?: React.ReactNode;
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
  buttonClassName,
  icon,
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

  if (icon) {
    // md: 40px, objetivo táctil cómodo para la vista de celular
    const circle = size === 'md' ? 'w-10 h-10' : 'w-8 h-8';
    const iconButtonSize = size === 'md' ? 'icon' : 'icon-sm';

    if (confirming) {
      return (
        <div className={cn('flex items-center gap-1', className)} onClick={stop}>
          <button
            type="button"
            onClick={(e) => { stop(e); setConfirmingState(false); }}
            disabled={loading}
            title="Cancelar"
            aria-label="Cancelar"
            className={cn(circle, 'rounded-full border border-neutral-black-20 bg-white flex items-center justify-center text-neutral-black-100 hover:text-neutral-black-80 transition-colors disabled:opacity-40')}
          >
            <X size={size === 'md' ? 16 : 14} />
          </button>
          <Button
            onClick={handleConfirm}
            loading={loading}
            size={iconButtonSize}
            variant={variant}
            title={`Confirmar: ${label}`}
            aria-label={`Confirmar: ${label}`}
            className="rounded-full"
          >
            <Check size={size === 'md' ? 18 : 15} />
          </Button>
        </div>
      );
    }

    return (
      <Button
        onClick={(e) => { stop(e); setConfirmingState(true); }}
        size={iconButtonSize}
        variant={variant}
        title={label}
        aria-label={label}
        className={cn('rounded-full', className)}
      >
        {icon}
      </Button>
    );
  }

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
            'text-xs font-medium text-neutral-black-100 hover:text-neutral-black-80 border border-neutral-black-20 rounded-xl transition-colors disabled:opacity-40',
            fullWidth ? 'flex-1 py-2.5' : 'px-3 py-1.5',
            buttonClassName,
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
            className={buttonClassName}
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
      className={cn(buttonClassName, className)}
    >
      {label}
    </Button>
  );
}
