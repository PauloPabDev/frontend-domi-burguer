import {
  AlertTriangle, DollarSign, Package, ShoppingBag, TrendingUp,
} from 'lucide-react';
import { WorkerOrder } from '@/types/worker';
import type { ContabilidadStats } from '../calculateStats';
import { formatCOP } from '../utils';
import { StatCard } from './StatCard';
import { CourierSummaryCard } from './CourierSummaryCard';
import { PaymentMethodSection } from './PaymentMethodSection';
import { ProductsSoldSection } from './ProductsSoldSection';
import { CourierDeliverySection } from './CourierDeliverySection';
// import { CourierCashCollectedSection } from './CourierCashCollectedSection';
// import { CourierPaymentSection } from './CourierPaymentSection';
// import { KitchenSalesSection } from './KitchenSalesSection';

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
  const totalAssignedOrdersAll = courierEntries.reduce((sum, [, data]) => sum + data.totalAssignedOrders, 0);
  const totalAssignedDeliveryAll = courierEntries.reduce((sum, [, data]) => sum + data.totalAssignedDelivery, 0);
  // const kitchenEntries = Object.entries(stats.salesByKitchen); // usado por <KitchenSalesSection>, deshabilitada abajo

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

      {/* Domicilios: total + desglose por domiciliario (facturado vs. total asignado, sin eliminados) */}
      {courierEntries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CourierSummaryCard
            title="Total domicilios"
            subtitle={`${courierEntries.length} domiciliario(s)`}
            invoicedValue={stats.totalDeliveryCost}
            invoicedCount={stats.deliveryCount}
            totalValue={totalAssignedDeliveryAll}
            totalCount={totalAssignedOrdersAll}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          {courierEntries.map(([id, data]) => (
            <CourierSummaryCard
              key={id}
              title={data.name}
              photoURL={data.photoURL}
              invoicedValue={data.totalDelivery}
              invoicedCount={data.orderCount}
              totalValue={data.totalAssignedDelivery}
              totalCount={data.totalAssignedOrders}
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

      <PaymentMethodSection paymentEntries={paymentEntries} totalSales={stats.totalSales} />

      <ProductsSoldSection productsSortedByQty={productsSortedByQty} />

      <CourierDeliverySection
        courierEntries={courierEntries}
        deliveryCount={stats.deliveryCount}
        totalDeliveryCost={stats.totalDeliveryCost}
      />

      {/* <CourierCashCollectedSection courierEntries={courierEntries} totalDeliveryCost={stats.totalDeliveryCost} /> */}

      {/* Pago a domiciliarios */}
      {/* {courierEntries.length > 0 && (
        <CourierPaymentSection courierEntries={courierEntries} />
      )} */}

      {/* Ventas por cocina */}
      {/* {kitchenEntries.length > 1 && (
        <KitchenSalesSection kitchenEntries={kitchenEntries} />
      )} */}
    </div>
  );
}
