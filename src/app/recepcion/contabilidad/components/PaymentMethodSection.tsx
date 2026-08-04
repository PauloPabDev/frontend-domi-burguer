import { CreditCard } from 'lucide-react';
import { PAYMENT_LABELS } from '@/types/worker';
import type { PaymentMethodStat } from '../calculateStats';
import { formatCOP } from '../utils';
import { AccordionSection } from './AccordionSection';

interface PaymentMethodSectionProps {
  paymentEntries: [string, PaymentMethodStat][];
  totalSales: number;
}

export function PaymentMethodSection({ paymentEntries, totalSales }: PaymentMethodSectionProps) {
  if (paymentEntries.length === 0) return null;

  return (
    <AccordionSection icon={CreditCard} title="Ventas por método de pago" badge={paymentEntries.length} defaultOpen>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-black-3 text-neutral-black-50 text-xs">
            <th className="px-4 py-2 text-left font-semibold">Método</th>
            <th className="px-4 py-2 text-center font-semibold">Pedidos</th>
            <th className="px-4 py-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {paymentEntries.map(([method, data]) => (
            <tr key={method} className="border-t border-neutral-black-10">
              <td className="px-4 py-2.5 font-medium capitalize">{PAYMENT_LABELS[method] ?? method}</td>
              <td className="px-4 py-2.5 text-center text-neutral-black-50">{data.count}</td>
              <td className="px-4 py-2.5 text-right font-semibold text-emerald-700">{formatCOP(data.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-neutral-black-20">
            <td className="px-4 py-2.5 font-bold" colSpan={2}>Total</td>
            <td className="px-4 py-2.5 text-right font-bold text-emerald-700">{formatCOP(totalSales)}</td>
          </tr>
        </tfoot>
      </table>
    </AccordionSection>
  );
}
