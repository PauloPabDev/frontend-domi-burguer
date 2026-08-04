import { Wallet } from 'lucide-react';
import type { CourierStat } from '../calculateStats';
import { formatCOP } from '../utils';
import { AccordionSection } from './AccordionSection';
import { CourierCell } from './CourierCell';

interface CourierCashCollectedSectionProps {
  courierEntries: [string, CourierStat][];
  totalDeliveryCost: number;
}

export function CourierCashCollectedSection({
  courierEntries,
  totalDeliveryCost,
}: CourierCashCollectedSectionProps) {
  if (courierEntries.length === 0 || !courierEntries.some(([, d]) => d.cashOrderCount > 0)) return null;

  return (
    <AccordionSection icon={Wallet} title="Recaudado por domiciliario" badge={courierEntries.length} defaultOpen>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-black-3 text-neutral-black-50 text-xs">
            <th className="px-4 py-2 text-left font-semibold">Domiciliario</th>
            <th className="px-4 py-2 text-center font-semibold">Pedidos efectivo</th>
            <th className="px-4 py-2 text-right font-semibold">Efectivo recaudado</th>
            <th className="px-4 py-2 text-right font-semibold">Domicilios</th>
            <th className="px-4 py-2 text-right font-semibold">Neto a entregar</th>
          </tr>
        </thead>
        <tbody>
          {courierEntries.map(([id, data]) => (
            <tr key={id} className="border-t border-neutral-black-10">
              <td className="px-4 py-2.5">
                <CourierCell name={data.name} photoURL={data.photoURL} />
              </td>
              <td className="px-4 py-2.5 text-center text-neutral-black-50">{data.cashOrderCount}</td>
              <td className="px-4 py-2.5 text-right font-semibold text-neutral-black-80">
                {data.cashCollected > 0 ? formatCOP(data.cashCollected) : '—'}
              </td>
              <td className="px-4 py-2.5 text-right text-neutral-black-50">
                {data.totalDelivery > 0 ? formatCOP(data.totalDelivery) : '—'}
              </td>
              <td className="px-4 py-2.5 text-right font-bold text-emerald-700">
                {data.netToHandOver > 0 ? formatCOP(data.netToHandOver) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-neutral-black-20">
            <td className="px-4 py-2.5 font-bold" colSpan={2}>Total</td>
            <td className="px-4 py-2.5 text-right font-bold">
              {formatCOP(courierEntries.reduce((s, [, d]) => s + d.cashCollected, 0))}
            </td>
            <td className="px-4 py-2.5 text-right font-bold text-neutral-black-50">
              {formatCOP(totalDeliveryCost)}
            </td>
            <td className="px-4 py-2.5 text-right font-bold text-emerald-700">
              {formatCOP(courierEntries.reduce((s, [, d]) => s + d.netToHandOver, 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </AccordionSection>
  );
}
