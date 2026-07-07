import { Banknote, Building2, Smartphone, CreditCard } from 'lucide-react';
import { PAYMENT_LABELS } from '@/types/worker';
import { formatCOP } from '@/components/ui/OrderItemsList';
import { cn } from '@/lib/utils';

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

interface OrderPaymentRowProps {
  paymentMethod: string;
  paid?: boolean;
  total?: number;
  withBorderTop?: boolean;
  muted?: boolean;
  className?: string;
}

export function OrderPaymentRow({
  paymentMethod,
  paid = false,
  total = 0,
  withBorderTop = false,
  muted = false,
  className,
}: OrderPaymentRowProps) {
  const Icon = PAYMENT_ICONS[paymentMethod] ?? CreditCard;
  const cashChange = paymentMethod === 'cash' && total > 0 ? getCashChange(total) : null;

  return (
    <div
      className={cn(
        withBorderTop && 'border-t border-neutral-black-10 pt-2',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-neutral-black-50" />
          <span
            className={cn(
              'text-sm font-medium',
              muted ? 'text-neutral-black-50' : 'text-neutral-black-80',
            )}
          >
            {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
          </span>
        </div>
        <span
          className={cn(
            'text-base font-bold',
            paid ? 'line-through text-green-500' : 'text-neutral-black-80',
          )}
        >
          {formatCOP(total)}
        </span>
      </div>
      {cashChange && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-neutral-black-50">Con {formatCOP(cashChange.bill)}</span>
          <span className="text-sm font-semibold text-amber-600">Devolver {formatCOP(cashChange.change)}</span>
        </div>
      )}
    </div>
  );
}
