"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  BarChart3, Search, RefreshCw, ChevronDown, ChevronUp,
  ShoppingBag, DollarSign, TrendingUp, Bike, CreditCard,
  Package, ChefHat, AlertTriangle, Clock, Filter, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { PAYMENT_LABELS, WorkerOrder } from '@/types/worker';
import { cn } from '@/lib/utils';
import { useContabilidad } from '@/hooks/reception/useContabilidad';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';
import { calculateStats, ContabilidadStats } from './calculateStats';

// ─── date helpers ─────────────────────────────────────────────────────────────

const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const formatLocalDateTime = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const formatCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

const normalize = (s?: string) =>
  (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// ─── sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, title, value, sub, iconBg, iconColor }: {
  icon: React.ElementType;
  title: string;
  value: string;
  sub?: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-black-20 bg-white p-4 flex flex-col gap-1.5">
      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center', iconBg)}>
        <Icon size={18} className={iconColor} />
      </div>
      <p className="text-xs text-neutral-black-50 mt-0.5">{title}</p>
      <p className="text-lg font-bold text-neutral-black-80 leading-none">{value}</p>
      {sub && <p className="text-xs text-neutral-black-50">{sub}</p>}
    </div>
  );
}

function AccordionSection({ title, icon: Icon, badge, children, defaultOpen = false }: {
  title: string;
  icon: React.ElementType;
  badge?: string | number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-neutral-black-20 bg-white overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-neutral-black-3 transition-colors"
      >
        <Icon size={16} className="text-neutral-black-50 shrink-0" />
        <span className="font-semibold text-sm text-neutral-black-80 flex-1">{title}</span>
        {badge !== undefined && (
          <span className="text-xs font-bold bg-neutral-black-10 text-neutral-black-50 rounded-full px-2 py-0.5">
            {badge}
          </span>
        )}
        {open ? <ChevronUp size={16} className="text-neutral-black-50 shrink-0" /> : <ChevronDown size={16} className="text-neutral-black-50 shrink-0" />}
      </button>
      {open && <div className="border-t border-neutral-black-10">{children}</div>}
    </div>
  );
}

function OrderRow({ order }: { order: WorkerOrder }) {
  const [expanded, setExpanded] = useState(false);
  const clientName = order.client?.name ?? order.user?.name ?? 'Sin cliente';
  const clientPhone = order.client?.phone ?? order.user?.phone;

  const itemsSummary = order.orderItems
    .map((i) => `${i.quantity}x ${i.name}`)
    .join(', ');

  return (
    <div className="rounded-2xl border border-neutral-black-20 bg-white overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-4 hover:bg-neutral-black-3 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="shrink-0 w-8 h-8 rounded-full bg-primary-red text-white text-sm font-bold flex items-center justify-center mt-0.5">
              {order.dailyOrderNumber ?? '?'}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-neutral-black-80 truncate">{clientName}</p>
              {clientPhone && (
                <p className="text-xs text-neutral-black-50 mt-0.5">{clientPhone}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-sm font-bold text-neutral-black-80">{formatCOP(order.totalPrice)}</span>
            <OrderStatusBadge status={order.status} className="text-[10px] px-2 py-0.5" />
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-black-50">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatTime(order.updatedAt)}
          </span>
          <span className="flex items-center gap-1">
            <CreditCard size={11} />
            {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
          </span>
          {order.courier?.name && (
            <span className="flex items-center gap-1">
              <Bike size={11} />
              {order.courier.name}
            </span>
          )}
          {order.kitchen?.name && (
            <span className="flex items-center gap-1">
              <ChefHat size={11} />
              {order.kitchen.name}
            </span>
          )}
        </div>

        <p className="mt-1.5 text-xs text-neutral-black-50 truncate">{itemsSummary}</p>
      </button>

      {expanded && (
        <div className="border-t border-neutral-black-10 px-4 py-3 space-y-2">
          {order.orderItems.map((item, idx) => (
            <div key={idx} className="text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-neutral-black-80">
                  {item.quantity}× {item.name}
                </span>
                <span className="text-neutral-black-50">{formatCOP(item.price * item.quantity)}</span>
              </div>
              {item.complements && item.complements.length > 0 && (
                <ul className="mt-0.5 pl-4 text-xs text-neutral-black-50 space-y-0.5">
                  {item.complements.map((c, ci) => (
                    <li key={ci}>
                      {c.quantity}× {c.name}
                      {c.price > 0 && ` (+${formatCOP(c.price * c.quantity)})`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {order.deliveryPrice > 0 && (
            <div className="flex justify-between text-sm border-t border-neutral-black-10 pt-2">
              <span className="text-neutral-black-50">Domicilio</span>
              <span className="text-neutral-black-50">{formatCOP(order.deliveryPrice)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold border-t border-neutral-black-10 pt-2">
            <span>Total</span>
            <span>{formatCOP(order.totalPrice)}</span>
          </div>
          {order.comment && (
            <p className="text-xs text-neutral-black-50 italic border-t border-neutral-black-10 pt-2">
              {order.comment}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StatsSection({ stats, orders }: { stats: ContabilidadStats; orders: WorkerOrder[] }) {
  if (orders.length === 0) return null;

  const productsSortedByQty = Object.entries(stats.productsSold).sort(
    ([, a], [, b]) => b.quantity - a.quantity,
  );

  const paymentEntries = Object.entries(stats.salesByPaymentMethod);
  const courierEntries = Object.entries(stats.salesByCourier);
  const kitchenEntries = Object.entries(stats.salesByKitchen);

  return (
    <div className="space-y-3">
      {/* Stat cards */}
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

      {stats.totalNotInvoiced > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <AlertTriangle size={15} className="shrink-0" />
          <span>
            <strong>{stats.totalNotInvoiced}</strong> pedido{stats.totalNotInvoiced > 1 ? 's' : ''} sin
            facturar no se incluyen en las estadísticas de ventas.
          </span>
        </div>
      )}

      {/* Métodos de pago */}
      {paymentEntries.length > 0 && (
        <AccordionSection
          icon={CreditCard}
          title="Ventas por método de pago"
          badge={paymentEntries.length}
          defaultOpen
        >
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
                  <td className="px-4 py-2.5 font-medium capitalize">
                    {PAYMENT_LABELS[method] ?? method}
                  </td>
                  <td className="px-4 py-2.5 text-center text-neutral-black-50">{data.count}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-emerald-700">
                    {formatCOP(data.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-neutral-black-20">
                <td className="px-4 py-2.5 font-bold" colSpan={2}>Total</td>
                <td className="px-4 py-2.5 text-right font-bold text-emerald-700">
                  {formatCOP(stats.totalSales)}
                </td>
              </tr>
            </tfoot>
          </table>
        </AccordionSection>
      )}

      {/* Productos */}
      {productsSortedByQty.length > 0 && (
        <AccordionSection
          icon={Package}
          title="Productos vendidos"
          badge={productsSortedByQty.length}
        >
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
                        <img
                          src={data.image}
                          alt={data.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
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

      {/* Domiciliarios */}
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
                    <div className="flex items-center gap-2">
                      {data.photoURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.photoURL} alt={data.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-neutral-black-10 flex items-center justify-center shrink-0">
                          <Bike size={13} className="text-neutral-black-50" />
                        </div>
                      )}
                      <span className="font-medium">{data.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center text-neutral-black-50">{data.orderCount}</td>
                  <td className="px-4 py-2.5 text-right font-semibold">{formatCOP(data.totalDelivery)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AccordionSection>
      )}

      {/* Cocinas */}
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
                  <td className="px-4 py-2.5 text-right font-semibold text-emerald-700">
                    {formatCOP(data.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AccordionSection>
      )}
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function ContabilidadPage() {
  const { orders: allOrders, loading, error, fetchOrders } = useContabilidad();
  const { kitchens, selectedKitchenId, selectKitchen } = useKitchenSelector();

  const [startDate, setStartDate] = useState(() => getStartOfDay());
  const [endDate, setEndDate] = useState(() => getEndOfDay());
  const [search, setSearch] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('');
  const [showStats, setShowStats] = useState(true);

  // Auto-fetch today once a kitchen is selected
  useEffect(() => {
    if (!selectedKitchenId) return;
    fetchOrders(getStartOfDay().toISOString(), getEndOfDay().toISOString(), selectedKitchenId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKitchenId]);

  const handleFetch = useCallback(() => {
    if (!selectedKitchenId) return;
    fetchOrders(startDate.toISOString(), endDate.toISOString(), selectedKitchenId);
  }, [fetchOrders, startDate, endDate, selectedKitchenId]);

  const applyQuickFilter = useCallback(
    (start: Date, end: Date) => {
      if (!selectedKitchenId) return;
      setStartDate(start);
      setEndDate(end);
      fetchOrders(start.toISOString(), end.toISOString(), selectedKitchenId);
    },
    [fetchOrders, selectedKitchenId],
  );

  const quickFilters = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return [
      { label: 'Hoy', start: getStartOfDay(), end: getEndOfDay() },
      { label: 'Ayer', start: getStartOfDay(yesterday), end: getEndOfDay(yesterday) },
      { label: 'Esta semana', start: getStartOfDay(startOfWeek), end: getEndOfDay() },
      { label: 'Este mes', start: getStartOfDay(startOfMonth), end: getEndOfDay() },
    ];
  }, []);

  // Derive unique couriers from fetched orders
  const couriersFromOrders = useMemo(() => {
    const map = new Map<string, string>();
    allOrders.forEach((o) => {
      if (o.courierId && o.courier?.name) map.set(o.courierId, o.courier.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allOrders]);

  // Client-side filtering (courier + search only; kitchen is server-side)
  const filteredOrders = useMemo(() => {
    const q = normalize(search);
    return allOrders.filter((order) => {
      if (selectedCourier && order.courierId !== selectedCourier) return false;
      if (q) {
        const fields = [
          order.dailyOrderNumber?.toString(),
          order.client?.name,
          order.client?.phone,
          order.user?.name,
          order.user?.phone,
        ];
        if (!fields.some((f) => normalize(f).includes(q))) return false;
      }
      return true;
    });
  }, [allOrders, selectedCourier, search]);

  const stats = useMemo(() => calculateStats(filteredOrders), [filteredOrders]);

  const hasActiveFilters = search || selectedCourier;

  const clearFilters = () => {
    setSearch('');
    setSelectedCourier('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-red flex items-center justify-center shrink-0">
          <BarChart3 size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-neutral-black-80 leading-none">Contabilidad</h1>
          <p className="text-xs text-neutral-black-50 mt-0.5">Consulta y análisis de pedidos por período</p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="rounded-2xl border border-neutral-black-20 bg-white p-4 space-y-3">

        {/* Kitchen selector */}
        <div>
          <label className="block text-xs font-semibold text-neutral-black-50 mb-1">Cocina</label>
          <select
            value={selectedKitchenId ?? ''}
            onChange={(e) => selectKitchen(e.target.value || null)}
            className="w-full h-10 rounded-full border-[1.5px] border-neutral-black-20 px-4 text-sm text-neutral-black-80 bg-transparent focus:outline-none focus:border-neutral-black-50"
          >
            <option value="">Selecciona una cocina…</option>
            {kitchens.map((k) => (
              <option key={k.id} value={k.id}>{k.name}</option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-neutral-black-50 mb-1">Desde</label>
            <input
              type="datetime-local"
              value={formatLocalDateTime(startDate)}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="w-full h-10 rounded-full border-[1.5px] border-neutral-black-20 px-4 text-sm text-neutral-black-80 focus:outline-none focus:border-neutral-black-50 bg-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-neutral-black-50 mb-1">Hasta</label>
            <input
              type="datetime-local"
              value={formatLocalDateTime(endDate)}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="w-full h-10 rounded-full border-[1.5px] border-neutral-black-20 px-4 text-sm text-neutral-black-80 focus:outline-none focus:border-neutral-black-50 bg-transparent"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="primary"
              size="md"
              onClick={handleFetch}
              disabled={!selectedKitchenId}
              loading={loading}
              loadingText="Buscando..."
              leftIcon={<Search size={16} />}
              className="w-full sm:w-auto"
            >
              Buscar
            </Button>
          </div>
        </div>

        {/* Quick filters */}
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((f) => (
            <button
              key={f.label}
              onClick={() => applyQuickFilter(f.start, f.end)}
              disabled={loading || !selectedKitchenId}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-neutral-black-20 text-neutral-black-50 hover:bg-neutral-black-10 hover:text-neutral-black-80 transition-colors disabled:opacity-50"
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search + courier filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-black-50 pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar por cliente, teléfono o número…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-black-50 hover:text-neutral-black-80"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {couriersFromOrders.length > 0 && (
            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              className="h-10 rounded-full border-[1.5px] border-neutral-black-20 px-4 text-sm text-neutral-black-80 bg-transparent focus:outline-none focus:border-neutral-black-50 min-w-[180px]"
            >
              <option value="">Todos los domiciliarios</option>
              {couriersFromOrders.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Active filters badge */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-neutral-black-50">
              <Filter size={12} />
              Filtros activos:
            </span>
            {search && (
              <span className="text-xs font-medium bg-neutral-black-10 text-neutral-black-80 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                "{search}"
                <button onClick={() => setSearch('')}><X size={11} /></button>
              </span>
            )}
            {selectedCourier && (
              <span className="text-xs font-medium bg-neutral-black-10 text-neutral-black-80 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                <Bike size={11} />
                {couriersFromOrders.find((c) => c.id === selectedCourier)?.name}
                <button onClick={() => setSelectedCourier('')}><X size={11} /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-primary-red font-semibold hover:underline ml-1">
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* No kitchen selected */}
      {!selectedKitchenId && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-black-50 border border-neutral-black-20 rounded-2xl">
          <ChefHat size={36} className="opacity-30" />
          <p className="text-sm">Selecciona una cocina para cargar los pedidos</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" />
          {error}
          <Button variant="ghost" size="sm" onClick={handleFetch} className="ml-auto">
            <RefreshCw size={14} />
          </Button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-black-50">
          <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Cargando pedidos...</p>
        </div>
      )}

      {/* Content */}
      {!loading && allOrders.length > 0 && (
        <>
          {/* Stats toggle */}
          <button
            onClick={() => setShowStats((v) => !v)}
            className="w-full flex items-center gap-2 rounded-2xl border border-neutral-black-20 bg-white px-4 py-3 text-sm font-semibold text-neutral-black-80 hover:bg-neutral-black-3 transition-colors"
          >
            <BarChart3 size={16} className="text-neutral-black-50" />
            <span className="flex-1 text-left">Estadísticas del período</span>
            {showStats ? <ChevronUp size={16} className="text-neutral-black-50" /> : <ChevronDown size={16} className="text-neutral-black-50" />}
          </button>

          {showStats && <StatsSection stats={stats} orders={filteredOrders} />}

          {/* Orders list */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm text-neutral-black-80">
                  Pedidos
                </h2>
                <span className="text-xs font-bold bg-neutral-black-10 text-neutral-black-50 rounded-full px-2 py-0.5">
                  {filteredOrders.length}
                  {filteredOrders.length !== allOrders.length && ` / ${allOrders.length}`}
                </span>
              </div>
              <button
                onClick={handleFetch}
                disabled={loading}
                className="p-1.5 rounded-full text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10 transition-colors"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-black-50 border border-neutral-black-20 rounded-2xl">
                <ShoppingBag size={36} className="opacity-30" />
                <p className="text-sm">No hay pedidos que coincidan con los filtros</p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-primary-red font-semibold hover:underline">
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredOrders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty state (no fetch yet or no results at all) */}
      {!loading && allOrders.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-black-50 border border-neutral-black-20 rounded-2xl">
          <ShoppingBag size={40} className="opacity-30" />
          <p className="text-sm">No hay pedidos en el período seleccionado</p>
        </div>
      )}
    </div>
  );
}
