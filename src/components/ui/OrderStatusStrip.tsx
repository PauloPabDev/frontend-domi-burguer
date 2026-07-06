import { OrderStatus } from '@/types/orders';
import { STATUS_CONFIG } from '@/types/worker';
import { cn } from '@/lib/utils';

interface OrderStatusStripProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusStrip({ status, className }: OrderStatusStripProps) {
  return <div className={cn('h-1.5', STATUS_CONFIG[status]?.dotColor, className)} />;
}
