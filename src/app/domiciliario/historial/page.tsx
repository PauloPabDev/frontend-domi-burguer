"use client";

import { Bike, RefreshCw, PackageCheck } from 'lucide-react';
import { useCourierHistory } from '@/hooks/courier/useCourierHistory';
import { useEnrichedOrders } from '@/hooks/useEnrichedOrders';
import { HistoryStatsCard } from '@/components/courier/HistoryStatsCard';
import { HistoryOrderCard } from '@/components/courier/HistoryOrderCard';
import { Button } from '@/components/ui/button';

export default function HistorialPage() {
  const { orders: rawOrders, stats, loading, error, refetch } = useCourierHistory();
  const orders = useEnrichedOrders(rawOrders);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-neutral-black-50">
        <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Cargando historial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-neutral-black-50">
        <p className="text-sm text-red-500">{error}</p>
        <Button variant="outline" size="sm" onClick={refetch} leftIcon={<RefreshCw size={14} />}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto py-4 space-y-5 pb-8">
      {/* Estadísticas del día */}
      <HistoryStatsCard stats={stats} />

      {/* Lista de pedidos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bike size={16} className="text-neutral-black-50" />
            <h2 className="font-semibold text-sm text-neutral-black-80">Pedidos del día</h2>
            {orders.length > 0 && (
              <span className="text-xs font-bold bg-neutral-black-10 text-neutral-black-50 rounded-full px-2 py-0.5">
                {orders.length}
              </span>
            )}
          </div>
          <button
            onClick={refetch}
            className="p-1.5 rounded-full text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-black-50 border border-neutral-black-20 rounded-2xl">
            <PackageCheck size={40} className="opacity-30" />
            <p className="text-sm">No tienes entregas registradas hoy</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <HistoryOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
