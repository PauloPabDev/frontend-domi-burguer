"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ClipboardList, RefreshCw, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';
import { useEnrichedOrders } from '@/hooks/useEnrichedOrders';
import { useContabilidad } from '@/hooks/reception/useContabilidad';
import { CourierPanelProvider } from '@/contexts/CourierPanelContext';
import { AdminOrdersFilterBar } from '@/components/admin/AdminOrdersFilterBar';
import { AdminOrderRow } from '@/components/admin/AdminOrderRow';
import { AdminOrderDetailModal } from '@/components/admin/AdminOrderDetailModal';
import { WorkerOrderService } from '@/services/workerOrderService';
import { WorkerOrder } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { getStartOfDay, getEndOfDay } from '@/lib/dates';
import { normalize } from '@/lib/utils';
import { notify } from '@/utils/notify';

export default function AdminOrdenesPage() {
  const { user } = useAuth();
  const { kitchens } = useKitchenSelector();
  const { orders: rawOrders, loading, error, fetchOrders } = useContabilidad();
  const allOrders = useEnrichedOrders(rawOrders, kitchens);

  const [startDate, setStartDate] = useState(() => getStartOfDay());
  const [endDate, setEndDate] = useState(() => getEndOfDay());
  const [kitchenId, setKitchenId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    fetchOrders(startDate.toISOString(), endDate.toISOString(), kitchenId ?? undefined);
  }, [fetchOrders, startDate, endDate, kitchenId]);

  // Carga inicial: hoy, todas las cocinas
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyQuickFilter = useCallback(
    (start: Date, end: Date) => {
      setStartDate(start);
      setEndDate(end);
      fetchOrders(start.toISOString(), end.toISOString(), kitchenId ?? undefined);
    },
    [fetchOrders, kitchenId],
  );

  const quickFilters = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    return [
      { label: 'Hoy', start: getStartOfDay(), end: getEndOfDay() },
      { label: 'Ayer', start: getStartOfDay(yesterday), end: getEndOfDay(yesterday) },
      { label: 'Esta semana', start: getStartOfDay(startOfWeek), end: getEndOfDay() },
    ];
  }, []);

  const filteredOrders = useMemo(() => {
    const q = normalize(search);
    return allOrders
      .filter((order) => {
        if (statusFilter && order.status !== statusFilter) return false;
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
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allOrders, statusFilter, search]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
  };

  const selectedOrder = filteredOrders.find((o) => o.id === selectedOrderId)
    ?? allOrders.find((o) => o.id === selectedOrderId)
    ?? null;

  // ── Acciones de administración (todas requieren rol admin en el backend) ──

  const handleStatusChange = async (orderId: string, prev: OrderStatus, next: OrderStatus) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await WorkerOrderService.changeStatus(token, orderId, prev, next);
      notify.success('Estado actualizado', 'El cambio quedó registrado en la línea de tiempo de la orden.');
      refresh();
    } catch (e) {
      notify.error('Error al cambiar estado', e instanceof Error ? e.message : undefined);
      throw e;
    }
  };

  const handleAssignCourier = async (orderId: string, courierId: string | null) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await WorkerOrderService.assignCourier(token, orderId, courierId);
      refresh();
    } catch (e) {
      notify.error('Error al asignar domiciliario', e instanceof Error ? e.message : undefined);
      throw e;
    }
  };

  const handleAssignKitchen = async (orderId: string, newKitchenId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await WorkerOrderService.assignKitchen(token, orderId, newKitchenId);
      notify.success('Cocina actualizada', 'La cocina fue asignada correctamente.');
      refresh();
    } catch (e) {
      notify.error('Error al asignar cocina', e instanceof Error ? e.message : undefined);
      throw e;
    }
  };

  const handlePaymentMethodChange = async (orderId: string, previousMethod: string, method: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await WorkerOrderService.updatePaymentMethod(token, orderId, previousMethod, method);
      refresh();
    } catch (e) {
      notify.error('Error al cambiar método de pago', e instanceof Error ? e.message : undefined);
      throw e;
    }
  };

  const handleMarkPaid = async (orderId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await WorkerOrderService.markPaid(token, orderId);
      notify.success('Pago confirmado');
      refresh();
    } catch (e) {
      notify.error('Error al registrar pago', e instanceof Error ? e.message : undefined);
      throw e;
    }
  };

  const handleMarkPending = async (orderId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await WorkerOrderService.markPaymentPending(token, orderId);
      notify.success('Pago revertido a pendiente');
      refresh();
    } catch (e) {
      notify.error('Error al marcar el pago como pendiente', e instanceof Error ? e.message : undefined);
      throw e;
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await WorkerOrderService.deleteOrder(token, orderId);
      notify.success('Orden cancelada', 'La orden fue eliminada correctamente.');
      refresh();
    } catch (e) {
      notify.error('Error al cancelar orden', e instanceof Error ? e.message : undefined);
      throw e;
    }
  };

  return (
    <CourierPanelProvider>
      <div className="max-w-4xl mx-auto space-y-4 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center shrink-0">
              <ClipboardList size={20} className="text-primary-red" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-black-80 leading-none">Órdenes</h1>
              <p className="text-xs text-neutral-black-50 mt-0.5">
                Todas las órdenes por cocina y por día — cambia estados y pagos con permisos de admin
              </p>
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-1.5 rounded-full text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Filtros */}
        <AdminOrdersFilterBar
          kitchens={kitchens}
          selectedKitchenId={kitchenId}
          onSelectKitchen={(id) => { setKitchenId(id); fetchOrders(startDate.toISOString(), endDate.toISOString(), id ?? undefined); }}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          loading={loading}
          onFetch={refresh}
          quickFilters={quickFilters}
          onQuickFilter={applyQuickFilter}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onClearFilters={clearFilters}
        />

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            {error}
            <button onClick={refresh} className="ml-auto p-1.5 rounded-full hover:bg-red-100 transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>
        )}

        {/* Cargando */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-black-50">
            <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Cargando órdenes...</p>
          </div>
        )}

        {/* Lista */}
        {!loading && filteredOrders.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <h2 className="font-semibold text-sm text-neutral-black-80">Pedidos</h2>
              <span className="text-xs font-bold bg-neutral-black-10 text-neutral-black-50 rounded-full px-2 py-0.5">
                {filteredOrders.length}
                {filteredOrders.length !== allOrders.length && ` / ${allOrders.length}`}
              </span>
            </div>
            <div className="space-y-2">
              {filteredOrders.map((order) => (
                <AdminOrderRow key={order.id} order={order} onOpen={(o) => setSelectedOrderId(o.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Vacío */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-black-50 border border-neutral-black-20 rounded-2xl">
            <ShoppingBag size={40} className="opacity-30" />
            <p className="text-sm">
              {allOrders.length === 0 ? 'No hay órdenes en el período seleccionado' : 'Ninguna orden coincide con los filtros'}
            </p>
            {(search || statusFilter) && (
              <button onClick={clearFilters} className="text-xs text-primary-red font-semibold hover:underline">
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {selectedOrder && (
          <AdminOrderDetailModal
            order={selectedOrder as WorkerOrder}
            kitchens={kitchens}
            onClose={() => setSelectedOrderId(null)}
            onStatusChange={handleStatusChange}
            onAssignCourier={handleAssignCourier}
            onAssignKitchen={handleAssignKitchen}
            onPaymentMethodChange={handlePaymentMethodChange}
            onMarkPaid={handleMarkPaid}
            onMarkPending={handleMarkPending}
            onDelete={handleDeleteOrder}
          />
        )}
      </div>
    </CourierPanelProvider>
  );
}
