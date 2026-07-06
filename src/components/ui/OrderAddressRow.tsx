import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Location } from '@/types/locations';

interface OrderAddressRowProps {
  location?: Location
  address?: string;
  floor?: string;
  /** Compacto: sin fondo, ícono y texto más pequeños (para recepción) */
  compact?: boolean;
  className?: string;
}

export function OrderAddressRow({ location, address, floor, compact = false, className }: OrderAddressRowProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-1.5',
        !compact && 'bg-neutral-black-5 rounded-xl px-3 py-2',
        className,
      )}
    >
      <MapPin
        size={compact ? 11 : 14}
        className={cn('mt-0.5 shrink-0', compact ? 'text-neutral-black-50' : 'text-primary-red')}
      />
      <p
        className={cn(
          compact
            ? 'text-xs text-neutral-black-50 line-clamp-1'
            : 'text-sm text-neutral-black-80 leading-snug',
        )}
      >
        {address ?? 'Sin dirección'}
        {!compact && floor && <span className="text-neutral-black-50"> — {floor}</span>}
      </p>
    </div>
  );
}
