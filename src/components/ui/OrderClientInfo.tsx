import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderClientInfoProps {
  name?: string;
  phone?: string;
  /** Hora formateada, mostrada junto al teléfono (uso en recepción) */
  time?: string;
  /** text-sm para recepción, text-base para courier, omitir para cocina */
  nameSize?: 'sm' | 'base';
  onPhoneClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export function OrderClientInfo({
  name,
  phone,
  time,
  nameSize,
  onPhoneClick,
  className,
}: OrderClientInfoProps) {
  const phoneIconSize = nameSize === 'sm' ? 10 : 11;

  return (
    <div className={cn('min-w-0', className)}>
      <p
        className={cn(
          'font-bold text-neutral-black-80 leading-tight truncate',
          nameSize && `text-${nameSize}`,
        )}
      >
        {name ?? 'Cliente'}
      </p>
      {(phone || time) && (
        <div className={cn('flex items-center mt-0.5', time ? 'gap-3' : 'gap-1')}>
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-1 text-xs text-neutral-black-100 hover:text-primary-red"
              onClick={onPhoneClick}
            >
              <Phone size={phoneIconSize} />
              {phone}
            </a>
          )}
          {time && <span className="text-[10px] text-neutral-black-100">{time}</span>}
        </div>
      )}
    </div>
  );
}
