"use client";

import { Bike, MapPin, Clock, CreditCard, RefreshCw } from 'lucide-react';
import { useCourierHistory } from '@/hooks/courier/useCourierHistory';
import { EarningsCard } from '@/components/courier/EarningsCard';
import { Button } from '@/components/ui/button';

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  bancolombia: 'Bancolombia',
  nequi: 'Nequi',
};

export default function HistorialPage() {
  const { orders, stats, loading, error, refetch } = useCourierHistory();

  const formatCOP = (value: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-black-50">
        <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Cargando historial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-neutral-black-50">
        <p className="text-sm text-red-500">{error}</p>
        <Button variant="outline" size="sm" onClick={refetch} leftIcon={<RefreshCw size={14} />}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Earnings summary */}
      <EarningsCard stats={stats} />

      {/* Orders list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bike size={16} className="text-neutral-black-50" />
            <h2 className="font-semibold text-sm text-neutral-black-80">
              Pedidos del día
            </h2>
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
            <Bike size={40} className="opacity-30" />
            <p className="text-sm">No tienes entregas registradas hoy</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-neutral-black-20 bg-white p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-primary-red text-white rounded-full w-7 h-7 flex items-center justify-center shrink-0">
                      {order.dailyOrderNumber}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-neutral-black-80 leading-tight">
                        {order.client?.name ?? 'Cliente'}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={10} className="text-neutral-black-50" />
                        <span className="text-xs text-neutral-black-50">{formatTime(order.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary-red shrink-0">
                    {formatCOP(order.deliveryPrice)}
                  </span>
                </div>

                <div className="flex items-start gap-1.5">
                  <MapPin size={12} className="text-neutral-black-50 mt-0.5 shrink-0" />
                  <p className="text-xs text-neutral-black-50 line-clamp-1">
                    {order.deliveryAddress?.address}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-black-10 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-black-50">
                    <CreditCard size={11} />
                    {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                  </div>
                  <span className="text-xs text-neutral-black-50">
                    Total: {formatCOP(order.totalPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
