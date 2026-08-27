"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useEnrichedOrders } from '@/hooks/useEnrichedOrders';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';
import { useCourierDevicePhotos } from '@/hooks/reception/useCourierDevicePhotos';
import { MultiMarkerMap, MapMarker } from '@/components/map/MultiMarkerMap';
import { RecepcionOrderCard } from '@/components/recepcion/RecepcionOrderCard';
import { CourierFilterPanel } from '@/components/recepcion/CourierFilterPanel';
import { WorkerOrderService } from '@/services/workerOrderService';
import { OrderStatus } from '@/types/orders';
import { STATUS_CONFIG } from '@/types/worker';
import { MapPin, Bike } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCourierPanel } from '@/contexts/CourierPanelContext';

const MAP_STATUSES: OrderStatus[] = ['fresh', 'preparing', 'ready_for_pickup', 'dispatched', 'delivered',];

export default function RecepcionMapaPage() {
  const { user } = useAuth();
  const { orders, connectionStatus, courierLocations } = useSocket();
  const { kitchens } = useKitchenSelector();
  const enrichedOrders = useEnrichedOrders(orders, kitchens);

  const { filterCourierIds, allCouriers } = useCourierPanel();
  // Cruza cada domiciliario de Traccar (id_arceliuz) con su usuario real de la app
  const courierByDeviceId = useCourierDevicePhotos(courierLocations, allCouriers);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeStatuses, setActiveStatuses] = useState<Set<OrderStatus>>(new Set(MAP_STATUSES));
  const [showCouriers, setShowCouriers] = useState(true);

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
    (o) =>
      activeStatuses.has(o.status) &&
      o.deliveryAddress?.coordinates &&
      (filterCourierIds.size === 0 || (o.courierId && filterCourierIds.has(o.courierId))),
  );

  const orderMarkers: MapMarker[] = visibleOrders.map((o) => ({
    id: o.id,
    position: o.deliveryAddress!.coordinates,
    label: String(o.dailyOrderNumber),
    color: STATUS_CONFIG[o.status]?.hex,
    avatarUrl: o.client?.photoURL,
    clientName: o.client?.name,
    isUnassigned: !o.courierId,
    courierAvatarUrl: o.courier?.photoURL,
    courierName: o.courier?.name,
  }));

  const courierMarkers: MapMarker[] = showCouriers
    ? courierLocations.map((c) => {
        const appCourier = courierByDeviceId.get(c.id);
        return {
          id: `courier-${c.id}`,
          position: { lat: c.lat, lng: c.lng },
          label: appCourier?.name ?? c.name,
          type: 'courier' as const,
          isOffline: c.status !== 'online',
          avatarUrl: appCourier?.photoURL,
        };
      })
    : [];

  const markers: MapMarker[] = [...orderMarkers, ...courierMarkers];

  const selectedOrder = visibleOrders.find((o) => o.id === selectedId);
  const selectedCenter = selectedOrder?.deliveryAddress?.coordinates;

  const handleStatusChange = async (orderId: string, prev: OrderStatus, next: OrderStatus) => {
    if (!user) return;
    const token = await user.getIdToken();
    await WorkerOrderService.changeStatus(token, orderId, prev, next);
  };

  const handleAssignCourier = async (orderId: string, courierId: string | null) => {
    if (!user) return;
    const token = await user.getIdToken();
    await WorkerOrderService.assignCourier(token, orderId, courierId);
  };

  const handleAssignKitchen = async (orderId: string, kitchenId: string) => {
    if (!user) return;
    const token = await user.getIdToken();
    await WorkerOrderService.assignKitchen(token, orderId, kitchenId);
  };

  const handlePaymentMethodChange = async (orderId: string, previousMethod: string, method: string) => {
    if (!user) return;
    const token = await user.getIdToken();
    await WorkerOrderService.updatePaymentMethod(token, orderId, previousMethod, method);
  };

  const handleMarkPaid = async (orderId: string) => {
    if (!user) return;
    const token = await user.getIdToken();
    await WorkerOrderService.markPaid(token, orderId);
  };

  const handleMarkPending = async (orderId: string) => {
    if (!user) return;
    const token = await user.getIdToken();
    await WorkerOrderService.markPaymentPending(token, orderId);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!user) return;
    const token = await user.getIdToken();
    await WorkerOrderService.deleteOrder(token, orderId);
  };

  return (
    <div className="h-[calc(100vh-106px)] flex flex-col lg:flex-row gap-3 -mb-4">
      {/* Map */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-neutral-black-20 h-[45%] shrink-0 lg:h-full lg:flex-1">
        <MultiMarkerMap
          markers={markers}
          selectedMarkerId={selectedId ?? undefined}
          center={selectedCenter}
          onMarkerClick={(id) => setSelectedId(id)}
          minHeight="100%"
          defaultZoom={13}
          selectedZoom={16}
        />
      </div>

      {/* Sidebar */}
      <div className="lg:w-[360px] lg:flex-none flex flex-col gap-2 min-h-0 pb-4">
        {/* Courier filter */}
        <CourierFilterPanel className="shrink-0" />

        {/* Toggle de ubicación en vivo de domiciliarios (Traccar) */}
        <button
          type="button"
          onClick={() => setShowCouriers((prev) => !prev)}
          className={cn(
            'flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border transition-all shrink-0 w-fit',
            showCouriers
              ? 'bg-[#34C759]/10 text-[#1f8a3b] border-[#34C759]/40'
              : 'bg-white text-neutral-black-40 border-neutral-black-20',
          )}
        >
          <Bike size={14} />
          Domiciliarios en vivo
          {courierLocations.length > 0 && (
            <span className="rounded-full bg-[#34C759] text-white px-1.5 leading-4">
              {courierLocations.filter((c) => c.status === 'online').length}
            </span>
          )}
        </button>

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
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('button, input, select, a, label')) return;
                  setSelectedId(order.id);
                }}
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
                  onDelete={handleDeleteOrder}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  onMarkPaid={handleMarkPaid}
                  onMarkPending={handleMarkPending}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
