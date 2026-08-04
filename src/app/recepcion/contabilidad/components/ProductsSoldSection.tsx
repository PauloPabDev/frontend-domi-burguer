import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductStat } from '../calculateStats';
import { formatCOP } from '../utils';
import { AccordionSection } from './AccordionSection';

interface ProductsSoldSectionProps {
  productsSortedByQty: [string, ProductStat][];
}

export function ProductsSoldSection({ productsSortedByQty }: ProductsSoldSectionProps) {
  if (productsSortedByQty.length === 0) return null;

  return (
    <AccordionSection icon={Package} title="Productos vendidos" badge={productsSortedByQty.length}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-black-3 text-neutral-black-50 text-xs">
            <th className="px-4 py-2 text-left font-semibold">Producto</th>
            <th className="px-4 py-2 text-center font-semibold">Cant.</th>
            <th className="px-4 py-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {productsSortedByQty.map(([id, data]) => (
            <tr key={id} className="border-t border-neutral-black-10">
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  {data.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={data.image} alt={data.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                  )}
                  <span className={cn('font-medium', id.startsWith('comp:') && 'text-neutral-black-50 text-xs')}>
                    {data.name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-2.5 text-center text-neutral-black-50">{data.quantity}</td>
              <td className="px-4 py-2.5 text-right font-semibold">
                {data.total > 0 ? formatCOP(data.total) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AccordionSection>
  );
}
