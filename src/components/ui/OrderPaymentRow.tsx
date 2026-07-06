import { CreditCard } from 'lucide-react';
import { PAYMENT_LABELS } from '@/types/worker';
import { formatCOP } from '@/components/ui/OrderItemsList';
import { cn } from '@/lib/utils';

interface OrderPaymentRowProps {
  paymentMethod: string;
  /** Si se pasa, muestra el total formateado a la derecha */
  total?: number;
  /** Añade borde superior y padding (para uso dentro de secciones expandibles) */
  withBorderTop?: boolean;
  /** Texto del método de pago en muted (texto gris) en lugar de oscuro */
  muted?: boolean;
  className?: string;
}

export function OrderPaymentRow({
  paymentMethod,
  total,
  withBorderTop = false,
  muted = false,
  className,
}: OrderPaymentRowProps) {
  return (
    <div
      className={cn(
        'flex items-center',
        total !== undefined ? 'justify-between' : '',
        withBorderTop && 'border-t border-neutral-black-10 pt-2',
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <CreditCard size={13} className="text-neutral-black-50" />
        <span
          className={cn(
            'text-xs font-medium',
            muted ? 'text-neutral-black-50' : 'text-neutral-black-80',
          )}
        >
          {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
        </span>
      </div>
      {total !== undefined && (
        <span className="text-xs font-bold text-neutral-black-80">{formatCOP(total)}</span>
      )}
    </div>
  );
}
