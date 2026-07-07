"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useEnrichedOrders } from '@/hooks/useEnrichedOrders';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';
import { MultiMarkerMap, MapMarker } from '@/components/map/MultiMarkerMap';
import { RecepcionOrderCard } from '@/components/recepcion/RecepcionOrderCard';
import { WorkerOrderService } from '@/services/workerOrderService';
import { OrderStatus } from '@/types/orders';
import { STATUS_CONFIG } from '@/types/worker';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAP_STATUSES: OrderStatus[] = ['fresh', 'preparing', 'ready_for_pickup', 'dispatched'];

export default function RecepcionMapaPage() {
  const { user } = useAuth();
  const { orders, connectionStatus } = useSocket();
  const { kitchens } = useKitchenSelector();
  const enrichedOrders = useEnrichedOrders(orders, kitchens);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeStatuses, setActiveStatuses] = useState<Set<OrderStatus>>(new Set(MAP_STATUSES));

  const sidebarRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Scroll sidebar to selected card when a marker is clicked
  useEffect(() => {
    if (!selectedId) return;
    const card = cardRefs.current.get(selectedId);
    if (card && sidebarRef.current) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedId]);

  const toggleStatus = (status: OrderStatus) => {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const visibleOrders = enrichedOrders.filter(
    (o) => activeStatuses.has(o.status) && o.deliveryAddress?.coordinates,
  );

  const markers: MapMarker[] = visibleOrders.map((o) => ({
    id: o.id,
    position: o.deliveryAddress!.coordinates,
    label: String(o.dailyOrderNumber),
    color: STATUS_CONFIG[o.status]?.hex,
    avatarUrl: o.client?.photoURL,
    clientName: o.client?.name,
  }));

  const selectedOrder = visibleOrders.find((o) => o.id === selectedId);
  const selectedCenter = selectedOrder?.deliveryAddress?.coordinates;

  const handleStatusChange = async (orderId: string, prev: OrderStatus, next: OrderStatus) => {
    if (!user) return;
    const token = await user.getIdToken();
    await WorkerOrderService.changeStatus(token, orderId, prev, next);
  };

  const handleAssignCourier = async (orderId: string, courierId: string) => {
    if (!user) return;
    const token = await user.getIdToken();
    await WorkerOrderService.assignCourier(token, orderId, courierId);
  };

  const handleAssignKitchen = async (orderId: string, kitchenId: string) => {
    if (!user) return;
    const token = await user.getIdToken();
    await WorkerOrderService.assignKitchen(token, orderId, kitchenId);
  };

  const handlePaymentMethodChange = async (orderId: string, method: string) => {
    if (!user) return;
    const token = await user.getIdToken();
    await WorkerOrderService.updatePaymentMethod(token, orderId, method);
  };

  const handleMarkPaid = async (orderId: string) => {
    if (!user) return;
    const token = await user.getIdToken();
    await WorkerOrderService.markPaid(token, orderId);
  };

  return (
    <div className="h-[calc(100vh-106px)] flex flex-col lg:flex-row gap-3 -mb-4">
      {/* Map */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-neutral-black-20 h-[45%] shrink-0 lg:h-full lg:flex-1">
        <MultiMarkerMap
          markers={markers}
          selectedMarkerId={selectedId ?? undefined}
          center={selectedCenter}
          onMarkerClick={(id) => setSelectedId((prev) => (prev === id ? null : id))}
          minHeight="100%"
          defaultZoom={13}
          selectedZoom={16}
        />
      </div>

      {/* Sidebar */}
      <div className="lg:w-[360px] lg:flex-none flex flex-col gap-2 min-h-0 pb-4">
        {/* Status filter chips */}
        <div className="flex gap-1.5 flex-wrap shrink-0">
          {MAP_STATUSES.map((status) => {
            const cfg = STATUS_CONFIG[status];
            const active = activeStatuses.has(status);
            return (
              <button
                key={status}
                type="button"
                onClick={() => toggleStatus(status)}
                className={cn(
                  'text-xs font-semibold px-2.5 py-1 rounded-full border transition-all',
                  active
                    ? `${cfg.bg} ${cfg.color} border-transparent`
                    : 'bg-white text-neutral-black-40 border-neutral-black-20',
                )}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Connection state */}
        {connectionStatus === 'CONNECTING' && (
          <p className="text-xs text-center text-neutral-black-50 animate-pulse">Conectando...</p>
        )}

        {/* Order list */}
        {visibleOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-neutral-black-50">
            <MapPin size={40} className="opacity-30" />
            <p className="text-sm text-center">
              No hay órdenes con ubicación <br /> para los filtros seleccionados
            </p>
          </div>
        ) : (
          <div
            ref={sidebarRef}
            className="flex flex-col gap-3 overflow-y-auto flex-1"
            style={{ scrollbarWidth: 'thin' }}
          >
            {visibleOrders.map((order) => (
              <div
                key={order.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(order.id, el);
                  else cardRefs.current.delete(order.id);
                }}
                onClick={() => setSelectedId((prev) => (prev === order.id ? null : order.id))}
                className={cn(
                  'rounded-2xl transition-all cursor-pointer',
                  selectedId === order.id
                    ? 'ring-2 ring-primary-red ring-offset-1'
                    : 'hover:ring-1 hover:ring-neutral-black-20 hover:ring-offset-1',
                )}
              >
                <RecepcionOrderCard
                  order={order}
                  kitchens={kitchens}
                  onStatusChange={handleStatusChange}
                  onAssignCourier={handleAssignCourier}
                  onAssignKitchen={handleAssignKitchen}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  onMarkPaid={handleMarkPaid}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
