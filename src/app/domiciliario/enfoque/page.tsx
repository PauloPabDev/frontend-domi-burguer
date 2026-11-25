"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bike, Map as MapIcon, Undo2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useEnrichedOrders } from '@/hooks/useEnrichedOrders';
import { setCourierView } from '@/hooks/courier/useCourierView';
import { CourierFocusCard, FOCUS_STATUS_LABEL } from '@/components/courier/CourierFocusCard';
import { STATUS_TRANSITIONS } from '@/components/courier/CourierOrderCard';
import { OrderElapsedTime } from '@/components/ui/OrderElapsedTime';
import { formatCOP } from '@/components/ui/OrderItemsList';
import { Skeleton } from '@/components/ui/skeleton';
import { CourierService } from '@/services/courierService';
import { OrderStatus } from '@/types/orders';
import { STATUS_CONFIG } from '@/types/worker';
import { notify } from '@/utils/notify';
import { track } from '@/utils/analytics';
import { cn } from '@/lib/utils';

// Margen para deshacer: el cambio de estado solo se envía al servidor cuando se acaba
const UNDO_MS = 5000;

interface PendingChange {
  orderId: string;
  number: number;
  prev: OrderStatus;
  next: OrderStatus;
}

const without = (map: Record<string, OrderStatus>, id: string) => {
  const copy = { ...map };
  delete copy[id];
  return copy;
};

export default function DomiciliarioEnfoquePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { orders, connectionStatus, ordersReady } = useSocket();
  const enrichedOrders = useEnrichedOrders(orders);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Estado adelantado de cada orden mientras el servidor confirma (o se puede deshacer)
  const [optimistic, setOptimistic] = useState<Record<string, OrderStatus>>({});
  const [undoable, setUndoable] = useState<PendingChange | null>(null);
  const undoableRef = useRef<PendingChange | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  const commit = useCallback(async (change: PendingChange) => {
    try {
      const token = await userRef.current?.getIdToken();
      if (!token) throw new Error('Sin sesión');
      await CourierService.changeStatus(token, change.orderId, change.prev, change.next);
    } catch {
      setOptimistic((prev) => without(prev, change.orderId));
      notify.error('No se pudo cambiar el estado', `Pedido #${change.number}. Inténtalo de nuevo.`);
    }
  }, []);

  // Envía ya el cambio que estaba en espera (al acabar el margen, al cambiar de pedido o al salir)
  const flush = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    const change = undoableRef.current;
    undoableRef.current = null;
    setUndoable(null);
    if (change) void commit(change);
  }, [commit]);

  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      flush();
    };
  }, [flush]);

  // Cuando el socket ya refleja el cambio (o la orden salió de la lista), se suelta el estado adelantado
  useEffect(() => {
    setOptimistic((prev) => {
      let next = prev;
      for (const id of Object.keys(prev)) {
        const order = enrichedOrders.find((o) => o.id === id);
        if (!order || order.status === prev[id]) next = without(next, id);
      }
      return next;
    });
  }, [enrichedOrders]);

  const advance = (orderId: string, number: number, prev: OrderStatus, next: OrderStatus) => {
    flush();
    const change = { orderId, number, prev, next };
    undoableRef.current = change;
    setUndoable(change);
    setOptimistic((o) => ({ ...o, [orderId]: next }));
    timerRef.current = setTimeout(flush, UNDO_MS);
  };

  const undo = () => {
    const change = undoableRef.current;
    if (!change) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    undoableRef.current = null;
    setUndoable(null);
    setOptimistic((o) => without(o, change.orderId));
    setSelectedId(change.orderId);
  };

  const statusOf = (id: string, real: OrderStatus) => optimistic[id] ?? real;
  const visible = enrichedOrders.filter((o) => statusOf(o.id, o.status) !== 'delivered');
  const selected = visible.find((o) => o.id === selectedId) ?? visible[0];
  const selectedStatus = selected ? statusOf(selected.id, selected.status) : undefined;
  const transition = selectedStatus ? STATUS_TRANSITIONS[selectedStatus] : undefined;
  const mustCollect = !!selected && selected.paymentMethod === 'cash' && selected.payment?.status !== 'approved';
  const actionLabel = transition && (transition.next === 'delivered' && mustCollect
    ? `Entregado · cobré ${formatCOP(selected!.totalPrice)}`
    : transition.label);
  const showSkeleton = !ordersReady && connectionStatus !== 'DISCONNECTED' && connectionStatus !== 'OFFLINE';

  const online = connectionStatus === 'CONNECTED';
  const connecting = connectionStatus === 'CONNECTING' || connectionStatus === 'RECONNECTING';

  const switchToClassic = () => {
    setCourierView('classic');
    track('courier_view_switch', { to: 'classic' });
    router.push('/domiciliario');
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col gap-2 py-3">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-extrabold text-neutral-black-80">Mis pedidos</h1>
        <div className="flex items-center gap-3">
          <span className={cn('flex items-center gap-1.5 text-xs font-bold', online ? 'text-green-700' : 'text-amber-700')}>
            <span className={cn('h-2 w-2 rounded-full', online ? 'bg-green-500' : 'bg-amber-500')} />
            {online ? 'En línea' : connecting ? 'Conectando…' : 'Sin conexión'}
          </span>
          <button
            type="button"
            onClick={switchToClassic}
            className="flex min-h-11 items-center gap-1.5 rounded-full border border-neutral-black-20 px-3 text-xs font-bold text-neutral-black-80"
          >
            <MapIcon size={16} />
            Vista clásica
          </button>
        </div>
      </header>

      {visible.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {visible.map((order) => {
            const status = statusOf(order.id, order.status);
            const on = order.id === selected?.id;
            return (
              <button
                key={order.id}
                type="button"
                aria-pressed={on}
                onClick={() => setSelectedId(order.id)}
                className={cn(
                  'flex min-h-11 shrink-0 items-center gap-2 rounded-full border-[1.5px] px-3.5 text-[15px] font-extrabold',
                  on ? 'border-neutral-black-80 bg-neutral-black-80 text-white' : 'border-neutral-black-20 bg-white text-neutral-black-80',
                )}
              >
                <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_CONFIG[status]?.dotColor)} aria-label={FOCUS_STATUS_LABEL[status] ?? STATUS_CONFIG[status]?.label} />
                #{order.dailyOrderNumber}
                <OrderElapsedTime createdAt={order.createdAt} status={status} className={cn('text-xs', on && '!text-white')} />
              </button>
            );
          })}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {showSkeleton ? (
          <div className="space-y-3 pt-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : selected && selectedStatus ? (
          <CourierFocusCard key={selected.id} order={selected} status={selectedStatus} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-neutral-black-50">
            <Bike size={44} className="opacity-40" />
            <p className="text-xl font-extrabold text-neutral-black-80">Sin pedidos asignados</p>
            <p className="max-w-[28ch] text-[15px]">Cuando te asignen uno aparecerá aquí.</p>
          </div>
        )}
      </div>

      {(undoable || (selected && transition)) && (
        <footer className="space-y-2 border-t border-neutral-black-10 bg-white pt-2">
          {undoable && (
            <div role="status" className="flex items-center justify-between gap-2 rounded-xl bg-neutral-black-80 py-1.5 pl-3.5 pr-1.5 text-sm font-semibold text-white">
              <span>#{undoable.number} {undoable.next === 'delivered' ? 'entregado' : 'en camino'}</span>
              <button type="button" onClick={undo} className="flex min-h-11 items-center gap-1.5 rounded-lg bg-white px-3.5 text-sm font-extrabold text-neutral-black-80">
                <Undo2 size={16} />
                Deshacer
              </button>
            </div>
          )}
          {selected && transition && (
            <button
              type="button"
              onClick={() => advance(selected.id, selected.dailyOrderNumber, selectedStatus!, transition.next)}
              className={cn(
                'min-h-16 w-full rounded-2xl text-lg font-extrabold text-white shadow-sm active:translate-y-px',
                transition.next === 'delivered' ? 'bg-neutral-black-80' : 'bg-primary-red',
              )}
            >
              {actionLabel}
            </button>
          )}
        </footer>
      )}
    </div>
  );
}
