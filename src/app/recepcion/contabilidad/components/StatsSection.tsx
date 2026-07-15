import {
  AlertTriangle, Bike, ChefHat, CreditCard,
  DollarSign, Package, ShoppingBag, TrendingUp, Wallet,
} from 'lucide-react';
import { PAYMENT_LABELS, WorkerOrder } from '@/types/worker';
import { cn } from '@/lib/utils';
import { ContabilidadStats } from '../calculateStats';
import { formatCOP } from '../utils';
import { StatCard } from './StatCard';
import { AccordionSection } from './AccordionSection';

interface StatsSectionProps {
  stats: ContabilidadStats;
  orders: WorkerOrder[];
}

export function StatsSection({ stats, orders }: StatsSectionProps) {
  if (orders.length === 0) return null;

  const productsSortedByQty = Object.entries(stats.productsSold).sort(
    ([, a], [, b]) => b.quantity - a.quantity,
  );
  const paymentEntries = Object.entries(stats.salesByPaymentMethod);
  const courierEntries = Object.entries(stats.salesByCourier);
  const kitchenEntries = Object.entries(stats.salesByKitchen);

  return (
    <div className="space-y-3">
      {/* Resumen general */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={DollarSign}
          title="Ventas totales"
          value={formatCOP(stats.totalSales)}
          sub={`${stats.totalInvoiced} pedidos facturados`}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatCard
          icon={ShoppingBag}
          title="Pedidos facturados"
          value={String(stats.totalInvoiced)}
          sub={stats.totalNotInvoiced > 0 ? `${stats.totalNotInvoiced} sin facturar` : undefined}
          iconBg="bg-sky-100"
          iconColor="text-sky-600"
        />
        <StatCard
          icon={Package}
          title="Productos vendidos"
          value={String(stats.totalProductsSold)}
          iconBg="bg-orange-100"
          iconColor="text-orange-500"
        />
        <StatCard
          icon={TrendingUp}
          title="Promedio pedido"
          value={formatCOP(stats.avgOrderValue)}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
        />
      </div>

      {/* Domicilios: total + desglose por domiciliario */}
      {stats.deliveryCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={Bike}
            title="Total domicilios"
            value={formatCOP(stats.totalDeliveryCost)}
            sub={`${stats.deliveryCount} domicilios · ${courierEntries.length} domiciliario(s)`}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          {courierEntries.map(([id, data]) => (
            <StatCard
              key={id}
              icon={Bike}
              title={data.name}
              value={formatCOP(data.totalDelivery)}
              sub={`${data.orderCount} domicilio${data.orderCount !== 1 ? 's' : ''}`}
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
            />
          ))}
        </div>
      )}

      {stats.totalNotInvoiced > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <AlertTriangle size={15} className="shrink-0" />
          <span>
            <strong>{stats.totalNotInvoiced}</strong> pedido{stats.totalNotInvoiced > 1 ? 's' : ''} sin
            facturar no se incluyen en las estadísticas de ventas.
          </span>
        </div>
      )}

      {/* Ventas por método de pago */}
      {paymentEntries.length > 0 && (
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
                <td className="px-4 py-2.5 text-right font-bold text-emerald-700">{formatCOP(stats.totalSales)}</td>
              </tr>
            </tfoot>
          </table>
        </AccordionSection>
      )}

      {/* Productos vendidos */}
      {productsSortedByQty.length > 0 && (
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
      )}

      {/* Domicilios por domiciliario */}
      {courierEntries.length > 0 && (
        <AccordionSection
          icon={Bike}
          title="Domicilios por domiciliario"
          badge={`${stats.deliveryCount} domicilios · ${formatCOP(stats.totalDeliveryCost)}`}
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
      )}

      {/* Recaudado por domiciliario */}
      {courierEntries.length > 0 && courierEntries.some(([, d]) => d.cashOrderCount > 0) && (
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
                  {formatCOP(stats.totalDeliveryCost)}
                </td>
                <td className="px-4 py-2.5 text-right font-bold text-emerald-700">
                  {formatCOP(courierEntries.reduce((s, [, d]) => s + d.netToHandOver, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </AccordionSection>
      )}

      {/* Ventas por cocina */}
      {kitchenEntries.length > 1 && (
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
      )}
    </div>
  );
}

function CourierCell({ name, photoURL }: { name: string; photoURL?: string }) {
  return (
    <div className="flex items-center gap-2">
      {photoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoURL} alt={name} className="w-7 h-7 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-neutral-black-10 flex items-center justify-center shrink-0">
          <Bike size={13} className="text-neutral-black-50" />
        </div>
      )}
      <span className="font-medium">{name}</span>
    </div>
  );
}
