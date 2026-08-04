import { Bike } from 'lucide-react';
import type { CourierStat } from '../calculateStats';
import { formatCOP } from '../utils';
import { AccordionSection } from './AccordionSection';
import { CourierCell } from './CourierCell';

interface CourierDeliverySectionProps {
  courierEntries: [string, CourierStat][];
  deliveryCount: number;
  totalDeliveryCost: number;
}

export function CourierDeliverySection({
  courierEntries,
  deliveryCount,
  totalDeliveryCost,
}: CourierDeliverySectionProps) {
  if (courierEntries.length === 0) return null;

  return (
    <AccordionSection
      icon={Bike}
      title="Domicilios por domiciliario"
      badge={`${deliveryCount} domicilios · ${formatCOP(totalDeliveryCost)}`}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-black-3 text-neutral-black-50 text-xs">
            <th className="px-4 py-2 text-left font-semibold">Domiciliario</th>
            <th className="px-4 py-2 text-center font-semibold">Pedidos</th>
            <th className="px-4 py-2 text-right font-semibold">Cobrado</th>
          </tr>
        </thead>
        <tbody>
          {courierEntries.map(([id, data]) => (
            <tr key={id} className="border-t border-neutral-black-10">
              <td className="px-4 py-2.5">
                <CourierCell name={data.name} photoURL={data.photoURL} />
              </td>
              <td className="px-4 py-2.5 text-center text-neutral-black-50">{data.orderCount}</td>
              <td className="px-4 py-2.5 text-right font-semibold">{formatCOP(data.totalDelivery)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AccordionSection>
  );
}
