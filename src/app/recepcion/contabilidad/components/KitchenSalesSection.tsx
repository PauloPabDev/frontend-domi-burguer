import { ChefHat } from 'lucide-react';
import type { KitchenStat } from '../calculateStats';
import { formatCOP } from '../utils';
import { AccordionSection } from './AccordionSection';

interface KitchenSalesSectionProps {
  kitchenEntries: [string, KitchenStat][];
}

export function KitchenSalesSection({ kitchenEntries }: KitchenSalesSectionProps) {
  if (kitchenEntries.length <= 1) return null;

  return (
    <AccordionSection icon={ChefHat} title="Ventas por cocina" badge={kitchenEntries.length}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-black-3 text-neutral-black-50 text-xs">
            <th className="px-4 py-2 text-left font-semibold">Cocina</th>
            <th className="px-4 py-2 text-center font-semibold">Pedidos</th>
            <th className="px-4 py-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {kitchenEntries.map(([id, data]) => (
            <tr key={id} className="border-t border-neutral-black-10">
              <td className="px-4 py-2.5 font-medium">{data.name}</td>
              <td className="px-4 py-2.5 text-center text-neutral-black-50">{data.orderCount}</td>
              <td className="px-4 py-2.5 text-right font-semibold text-emerald-700">{formatCOP(data.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AccordionSection>
  );
}
