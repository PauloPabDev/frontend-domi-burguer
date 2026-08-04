import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import type { CourierStat } from '../calculateStats';
import { formatCOP } from '../utils';
import { AccordionSection } from './AccordionSection';
import { CourierCell } from './CourierCell';

interface CourierPaymentSectionProps {
  courierEntries: [string, CourierStat][];
}

export function CourierPaymentSection({ courierEntries }: CourierPaymentSectionProps) {
  const totalToPayCouriers = courierEntries.reduce((sum, [, d]) => sum + Math.max(0, -d.netToHandOver), 0);
  const totalCourierOwes = courierEntries.reduce((sum, [, d]) => sum + Math.max(0, d.netToHandOver), 0);

  return (
    <AccordionSection
      icon={ArrowDownCircle}
      title="Pago a domiciliarios"
      badge={formatCOP(totalToPayCouriers)}
      defaultOpen
    >
      {/* Resumen de totales */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-black-3 border-b border-neutral-black-10">
        <div className="rounded-xl bg-white border border-neutral-black-10 px-3 py-2.5">
          <p className="text-xs text-neutral-black-50 mb-0.5">Restaurante paga</p>
          <p className="font-bold text-lg text-emerald-700">{formatCOP(totalToPayCouriers)}</p>
          <p className="text-xs text-neutral-black-40">Domicilios no recaudados en efectivo</p>
        </div>
        <div className="rounded-xl bg-white border border-neutral-black-10 px-3 py-2.5">
          <p className="text-xs text-neutral-black-50 mb-0.5">Domiciliarios entregan</p>
          <p className="font-bold text-lg text-neutral-black-80">{formatCOP(totalCourierOwes)}</p>
          <p className="text-xs text-neutral-black-40">Saldo de efectivo recaudado</p>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-black-3 text-neutral-black-50 text-xs">
            <th className="px-4 py-2 text-left font-semibold">Domiciliario</th>
            <th className="px-4 py-2 text-center font-semibold">Dom. digitales</th>
            <th className="px-4 py-2 text-right font-semibold">A pagar</th>
            <th className="px-4 py-2 text-right font-semibold">Saldo efectivo</th>
            <th className="px-4 py-2 text-right font-semibold">Acción</th>
          </tr>
        </thead>
        <tbody>
          {courierEntries.map(([id, data]) => {
            const toPay = Math.max(0, -data.netToHandOver);
            const owes = Math.max(0, data.netToHandOver);
            return (
              <tr key={id} className="border-t border-neutral-black-10">
                <td className="px-4 py-2.5">
                  <CourierCell name={data.name} photoURL={data.photoURL} />
                </td>
                <td className="px-4 py-2.5 text-center text-neutral-black-50">
                  {data.digitalOrderCount > 0 ? (
                    <span>{data.digitalOrderCount} · {formatCOP(data.digitalDeliveryOwed)}</span>
                  ) : (
                    <span className="text-neutral-black-30">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-emerald-700">
                  {toPay > 0 ? formatCOP(toPay) : <span className="text-neutral-black-30">—</span>}
                </td>
                <td className="px-4 py-2.5 text-right text-neutral-black-50">
                  {owes > 0 ? formatCOP(owes) : <span className="text-neutral-black-30">—</span>}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {toPay > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
                      <ArrowDownCircle size={11} />
                      Pagar
                    </span>
                  )}
                  {owes > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 rounded-full px-2 py-0.5">
                      <ArrowUpCircle size={11} />
                      Recibir
                    </span>
                  )}
                  {toPay === 0 && owes === 0 && (
                    <span className="text-xs text-neutral-black-30">Saldado</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-neutral-black-20 bg-neutral-black-3">
            <td className="px-4 py-2.5 font-bold" colSpan={2}>Total</td>
            <td className="px-4 py-2.5 text-right font-bold text-emerald-700">{formatCOP(totalToPayCouriers)}</td>
            <td className="px-4 py-2.5 text-right font-bold text-neutral-black-80">{formatCOP(totalCourierOwes)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </AccordionSection>
  );
}
