import { OrderStatus } from '@/types/orders';
import { STATUS_CONFIG } from '@/types/worker';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const FALLBACK_CONFIG = {
  label: 'Desconocido',
  color: 'text-neutral-black-50',
  bg: 'bg-neutral-black-10',
  dotColor: 'bg-neutral-black-50',
  hex: '#808080',
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? FALLBACK_CONFIG;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold',
        config.bg,
        config.color,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
