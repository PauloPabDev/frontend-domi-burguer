"use client";

import { MapPin, Clock, CreditCard, RefreshCw, TrendingUp, ShoppingBag, Bike } from 'lucide-react';
import { useReceptionHistory } from '@/hooks/reception/useReceptionHistory';
import { PAYMENT_LABELS, STATUS_CONFIG } from '@/types/worker';
import { Button } from '@/components/ui/button';

export default function RecepcionHistorialPage() {
  const { orders, loading, error, refetch, totalRevenue, totalDeliveryRevenue } = useReceptionHistory();

  const formatCOP = (v: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  const today = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-black-50">
        <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Cargando historial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-sm text-red-500">{error}</p>
        <Button variant="outline" size="sm" onClick={refetch} leftIcon={<RefreshCw size={14} />}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Summary card */}
      <div className="rounded-2xl overflow-hidden border border-neutral-black-20 bg-white shadow-sm">
        <div className="bg-primary-red p-5 text-white text-center">
          <TrendingUp size={28} className="mx-auto mb-1 opacity-80" />
          <p className="text-3xl font-bold">{formatCOP(totalRevenue)}</p>
          <p className="text-xs opacity-75 capitalize mt-0.5">{today}</p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-neutral-black-10 border-t border-neutral-black-10">
          <div className="flex flex-col items-center py-4 gap-1">
            <ShoppingBag size={18} className="text-primary-red" />
            <p className="text-xl font-bold text-neutral-black-80">{orders.length}</p>
            <p className="text-xs text-neutral-black-50">Pedidos</p>
          </div>
          <div className="flex flex-col items-center py-4 gap-1">
            <Bike size={18} className="text-primary-red" />
            <p className="text-xl font-bold text-neutral-black-80">{formatCOP(totalDeliveryRevenue)}</p>
            <p className="text-xs text-neutral-black-50">Domicilios</p>
          </div>
          <div className="flex flex-col items-center py-4 gap-1">
            <TrendingUp size={18} className="text-primary-red" />
            <p className="text-xl font-bold text-neutral-black-80">
              {orders.length > 0 ? formatCOP(totalRevenue / orders.length) : '$0'}
            </p>
            <p className="text-xs text-neutral-black-50">Promedio</p>
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-neutral-black-80">
            Pedidos del día
            {orders.length > 0 && (
              <span className="ml-2 text-xs font-bold bg-neutral-black-10 text-neutral-black-50 rounded-full px-2 py-0.5">
                {orders.length}
              </span>
            )}
          </h2>
          <button onClick={refetch} className="p-1.5 rounded-full text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10 transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-black-50 border border-neutral-black-20 rounded-2xl">
            <ShoppingBag size={40} className="opacity-30" />
            <p className="text-sm">No hay pedidos registrados hoy</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status];
              return (
                <div key={order.id} className="rounded-2xl border border-neutral-black-20 bg-white p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-primary-red text-white rounded-full w-7 h-7 flex items-center justify-center shrink-0">
                        {order.dailyOrderNumber}
                      </span>
                      <div>
                        <p className="font-semibold text-sm text-neutral-black-80">{order.client?.name ?? 'Cliente'}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={10} className="text-neutral-black-50" />
                          <span className="text-xs text-neutral-black-50">{formatTime(order.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-bold text-primary-red">{formatCOP(order.totalPrice)}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <MapPin size={11} className="text-neutral-black-50 mt-0.5 shrink-0" />
                    <p className="text-xs text-neutral-black-50 line-clamp-1">{order.deliveryAddress?.address}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-black-10 pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-black-50">
                      <CreditCard size={11} />
                      {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                    </div>
                    {order.courier?.name && (
                      <div className="flex items-center gap-1 text-xs text-neutral-black-50">
                        <Bike size={11} />
                        {order.courier.name}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
