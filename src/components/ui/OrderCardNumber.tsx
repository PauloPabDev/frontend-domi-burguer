import { cn } from '@/lib/utils';

interface OrderCardNumberProps {
  number: number;
  /** sm = w-7 h-7 text-xs (recepción), md = w-8 h-8 text-sm (courier, cocina) */
  size?: 'sm' | 'md';
  className?: string;
}

export function OrderCardNumber({ number, size = 'md', className }: OrderCardNumberProps) {
  return (
    <span
      className={cn(
        'font-bold bg-primary-red text-white rounded-full flex items-center justify-center shrink-0',
        size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm',
        className,
      )}
    >
      {number}
    </span>
  );
}
