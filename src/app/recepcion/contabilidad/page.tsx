"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import { BarChart3, ChefHat, ChevronDown, ChevronUp, AlertTriangle, RefreshCw, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContabilidad } from '@/hooks/reception/useContabilidad';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';
import { calculateStats } from './calculateStats';
import { getStartOfDay, getEndOfDay, normalize } from './utils';
import { FilterPanel } from './components/FilterPanel';
import { StatsSection } from './components/StatsSection';
import { OrderRow } from './components/OrderRow';

export default function ContabilidadPage() {
  const { orders: allOrders, loading, error, fetchOrders } = useContabilidad();
  const { kitchens, selectedKitchenId, selectKitchen } = useKitchenSelector();

  const [startDate, setStartDate] = useState(() => getStartOfDay());
  const [endDate, setEndDate] = useState(() => getEndOfDay());
  const [search, setSearch] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('');
  const [showStats, setShowStats] = useState(true);

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

  const couriersFromOrders = useMemo(() => {
    const map = new Map<string, string>();
    allOrders.forEach((o) => {
      if (o.assignedCourierUserId) map.set(o.assignedCourierUserId, o.courier?.name ?? 'Desconocido');
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allOrders]);
  console.log('Couriers from orders:', couriersFromOrders);

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
  const hasActiveFilters = !!(search || selectedCourier);

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

      {/* Filtros */}
      <FilterPanel
        kitchens={kitchens}
        selectedKitchenId={selectedKitchenId}
        onSelectKitchen={selectKitchen}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        loading={loading}
        onFetch={handleFetch}
        quickFilters={quickFilters}
        onQuickFilter={applyQuickFilter}
        search={search}
        onSearchChange={setSearch}
        couriers={couriersFromOrders}
        selectedCourier={selectedCourier}
        onCourierChange={setSelectedCourier}
        onClearFilters={clearFilters}
      />

      {/* Sin cocina seleccionada */}
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

      {/* Cargando */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-black-50">
          <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Cargando pedidos...</p>
        </div>
      )}

      {/* Contenido */}
      {!loading && allOrders.length > 0 && (
        <>
          <button
            onClick={() => setShowStats((v) => !v)}
            className="w-full flex items-center gap-2 rounded-2xl border border-neutral-black-20 bg-white px-4 py-3 text-sm font-semibold text-neutral-black-80 hover:bg-neutral-black-3 transition-colors"
          >
            <BarChart3 size={16} className="text-neutral-black-50" />
            <span className="flex-1 text-left">Estadísticas del período</span>
            {showStats
              ? <ChevronUp size={16} className="text-neutral-black-50" />
              : <ChevronDown size={16} className="text-neutral-black-50" />}
          </button>

          {showStats && <StatsSection stats={stats} orders={filteredOrders} />}

          {/* Lista de pedidos */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm text-neutral-black-80">Pedidos</h2>
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

      {/* Estado vacío */}
      {!loading && allOrders.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-black-50 border border-neutral-black-20 rounded-2xl">
          <ShoppingBag size={40} className="opacity-30" />
          <p className="text-sm">No hay pedidos en el período seleccionado</p>
        </div>
      )}
    </div>
  );
}
