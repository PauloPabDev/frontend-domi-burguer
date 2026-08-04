import { Bike } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCOP } from '../utils';

interface CourierSummaryCardProps {
  title: string;
  photoURL?: string;
  subtitle?: string;
  invoicedValue: number;
  invoicedCount: number;
  totalValue: number;
  totalCount: number;
  iconBg: string;
  iconColor: string;
}

export function CourierSummaryCard({
  title,
  photoURL,
  subtitle,
  invoicedValue,
  invoicedCount,
  totalValue,
  totalCount,
  iconBg,
  iconColor,
}: CourierSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-black-20 bg-white p-4 flex flex-col gap-2.5">
      <div className="flex items-center gap-2 min-w-0">
        {photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoURL} alt={title} className="w-9 h-9 rounded-full object-cover shrink-0" />
        ) : (
          <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', iconBg)}>
            <Bike size={18} className={iconColor} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold text-neutral-black-80 truncate">{title}</p>
          {subtitle && <p className="text-[11px] text-neutral-black-50 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[11px] text-neutral-black-50">Facturado</p>
          <p className="text-sm font-bold text-neutral-black-80 leading-tight">{formatCOP(invoicedValue)}</p>
          <p className="text-[11px] text-neutral-black-50">
            {invoicedCount} pedido{invoicedCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="border-l border-neutral-black-10 pl-2">
          <p className="text-[11px] text-neutral-black-50">Total asignado</p>
          <p className="text-sm font-bold text-neutral-black-80 leading-tight">{formatCOP(totalValue)}</p>
          <p className="text-[11px] text-neutral-black-50">
            {totalCount} pedido{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
