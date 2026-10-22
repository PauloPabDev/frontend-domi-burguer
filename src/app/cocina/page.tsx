"use client";

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';
import { useEnrichedOrders } from '@/hooks/useEnrichedOrders';
import { KitchenOrderCard } from '@/components/cocina/KitchenOrderCard';
import { KitchenOrderCardCompact } from '@/components/cocina/KitchenOrderCardCompact';
import { KitchenSelector } from '@/components/cocina/KitchenSelector';
import { WorkerOrderService } from '@/services/workerOrderService';
import { WorkerOrder } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { ChefHat, Clock, Layers, LayoutGrid, Rows3 } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortMode = 'time' | 'status';

const COMPACT_VIEW_KEY = 'domi_cocina_compact_view';

const STATUS_ORDER: Record<string, number> = { ready_for_pickup: 0, preparing: 1, fresh: 2 };

function buildProductSummary(orders: WorkerOrder[]) {
  const map = new Map<string, { id: string; name: string; color?: string; qty: number }>();
  for (const order of orders) {
    for (const item of order.orderItems) {
      if (!item.id) continue;
      const entry = map.get(item.id) ?? { id: item.id, name: item.name ?? item.id, color: item.colorPrimary, qty: 0 };
      entry.qty += item.quantity;
      map.set(item.id, entry);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.qty - a.qty);
}

export default function CocinaPage() {
  const { user } = useAuth();
  const { orders, connectionStatus } = useSocket();
  const { kitchens, selectedKitchenId, selectKitchen, changeKitchen, loading } = useKitchenSelectorWithSocket();
  const enrichedOrders = useEnrichedOrders(orders, kitchens);
  const [sortMode, setSortMode] = useState<SortMode>('time');

  // Vista simple (una columna, cards de dos filas): por defecto en celular, y después
  // la preferencia del navegador. Se lee tras montar para no romper la hidratación.
  const [compactView, setCompactView] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMPACT_VIEW_KEY);
      setCompactView(stored !== null ? stored === '1' : window.matchMedia('(max-width: 767px)').matches);
    } catch {
      setCompactView(window.matchMedia('(max-width: 767px)').matches);
    }
  }, []);

  const toggleCompactView = () => {
    setCompactView((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COMPACT_VIEW_KEY, next ? '1' : '0');
      } catch {
        // Sin persistencia: el cambio aplica solo a esta sesión
      }
      return next;
    });
  };

  const activeOrders = enrichedOrders.filter(
    (o) => o.status === 'fresh' || o.status === 'preparing'
  );

  const sortedOrders = [...activeOrders].sort((a, b) => {
    if (sortMode === 'status') {
      const diff = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
      if (diff !== 0) return diff;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const productSummary = useMemo(() => buildProductSummary(activeOrders), [activeOrders]);

  const handleStatusChange = async (orderId: string, prev: OrderStatus, next: OrderStatus) => {
    if (!user) return;
    const token = await user.getIdToken();
    await WorkerOrderService.changeStatus(token, orderId, prev, next);
  };

  if (!selectedKitchenId) {
    return (
      <KitchenSelector
        kitchens={kitchens}
        loading={loading}
        onSelect={(id) => {
          selectKitchen(id);
          changeKitchen(id);
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Barra de control */}
      <div className="flex items-center justify-between gap-3">
        {connectionStatus === 'CONNECTING' ? (
          <p className="text-sm text-neutral-black-50 animate-pulse">Conectando...</p>
        ) : (
          <span className="text-xs text-neutral-black-50">
            {activeOrders.length} pedido{activeOrders.length !== 1 ? 's' : ''} activo{activeOrders.length !== 1 ? 's' : ''}
          </span>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Sort toggle */}
          <div className="flex items-center gap-1 bg-neutral-black-10 rounded-full p-1 shrink-0">
            <button
              onClick={() => setSortMode('time')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer',
                sortMode === 'time'
                  ? 'bg-white text-neutral-black-80 shadow-sm'
                  : 'text-neutral-black-50 hover:text-neutral-black-80'
              )}
            >
              <Clock size={12} className="pointer-events-none" />
              Hora
            </button>
            <button
              onClick={() => setSortMode('status')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer',
                sortMode === 'status'
                  ? 'bg-white text-neutral-black-80 shadow-sm'
                  : 'text-neutral-black-50 hover:text-neutral-black-80'
              )}
            >
              <Layers size={12} className="pointer-events-none" />
              Estado
            </button>
          </div>

          {/* Vista simple / completa */}
          <button
            type="button"
            onClick={toggleCompactView}
            aria-pressed={compactView}
            title={compactView ? 'Ver cards completas' : 'Simplificar cards'}
            aria-label={compactView ? 'Ver cards completas' : 'Simplificar cards'}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-full border transition-colors cursor-pointer',
              compactView
                ? 'bg-neutral-black-80 text-white border-transparent'
                : 'bg-white text-neutral-black-60 border-neutral-black-20 hover:border-neutral-black-40'
            )}
          >
            {compactView ? <LayoutGrid size={14} /> : <Rows3 size={14} />}
          </button>
        </div>
      </div>

      {/* Resumen de productos pendientes */}
      {productSummary.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          <span className="text-[10px] font-bold text-neutral-black-50 uppercase tracking-wide shrink-0">
            Pendiente:
          </span>
          {productSummary.map(({ id, name, color, qty }) => (
            <span
              key={id}
              className="flex items-center gap-1.5 bg-white border border-neutral-black-20 rounded-full pl-1 pr-3 py-1 shrink-0"
            >
              <span
                className="min-w-6 h-6 px-1 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: color ?? 'var(--color-primary-red)' }}
              >
                {qty}
              </span>
              <span className="text-xs font-bold text-neutral-black-80">{name}</span>
            </span>
          ))}
        </div>
      )}

      {/* Grid de pedidos */}
      {sortedOrders.length === 0 && connectionStatus === 'CONNECTED' ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-black-50">
          <ChefHat size={48} className="opacity-30" />
          <p className="text-sm">No hay pedidos activos en tu cocina</p>
        </div>
      ) : compactView ? (
        // Vista simple: una sola columna, pensada para trabajar las órdenes desde el celular
        <div className="flex flex-col gap-2 max-w-2xl">
          {sortedOrders.map((order) => (
            <KitchenOrderCardCompact
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {sortedOrders.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function useKitchenSelectorWithSocket() {
  const { changeKitchen } = useSocket();
  const selector = useKitchenSelector();
  return { ...selector, changeKitchen };
}
