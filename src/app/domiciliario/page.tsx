"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useEnrichedOrders } from '@/hooks/useEnrichedOrders';
import { CourierOrderCard } from '@/components/courier/CourierOrderCard';
import { MultiMarkerMap, MapMarker } from '@/components/map/MultiMarkerMap';
import { CourierService } from '@/services/courierService';
import { OrderStatus } from '@/types/orders';
import { STATUS_CONFIG } from '@/types/worker';
import { Bike } from 'lucide-react';

export default function DomiciliarioPage() {
  const { user } = useAuth();
  const { orders, connectionStatus } = useSocket();
  const enrichedOrders = useEnrichedOrders(orders);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Auto-scroll to selected card (e.g. when tapping a map marker)
  useEffect(() => {
    if (!selectedId) return;
    const card = cardRefs.current.get(selectedId);
    if (card && carouselRef.current) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedId]);

  // When the carousel finishes snapping, select the centered card
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScrollEnd = () => {
      const center = carousel.scrollLeft + carousel.clientWidth / 2;
      let closestId: string | null = null;
      let closestDist = Infinity;
      cardRefs.current.forEach((el, id) => {
        const dist = Math.abs(el.offsetLeft + el.clientWidth / 2 - center);
        if (dist < closestDist) { closestDist = dist; closestId = id; }
      });
      if (closestId) setSelectedId(closestId);
    };

    carousel.addEventListener('scrollend', handleScrollEnd);
    return () => carousel.removeEventListener('scrollend', handleScrollEnd);
  }, []);

  const markers: MapMarker[] = enrichedOrders
    .filter((o) => o.deliveryAddress?.coordinates)
    .map((o) => ({
      id: o.id,
      position: o.deliveryAddress!.coordinates,
      label: String(o.dailyOrderNumber),
      color: STATUS_CONFIG[o.status]?.hex,
    }));

  const selectedOrder = enrichedOrders.find((o) => o.id === selectedId);
  const selectedCenter = selectedOrder?.deliveryAddress?.coordinates;

  const handleStatusChange = async (orderId: string, prev: OrderStatus, next: OrderStatus) => {
    if (!user) return;
    const token = await user.getIdToken();
    await CourierService.changeStatus(token, orderId, prev, next);
  };

  const isEmpty = enrichedOrders.length === 0;

  return (
    <div className="h-[calc(100dvh-3.5rem)] flex flex-col py-3 gap-3">
      {/* Map — always visible, fixed portion of screen */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-neutral-black-20 h-[45%] shrink-0">
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

      {/* Orders carousel */}
      <div className="flex-1 min-h-0 flex flex-col">
        {connectionStatus === 'CONNECTING' && (
          <p className="text-sm text-center text-neutral-black-50 animate-pulse py-4">Conectando...</p>
        )}

        {isEmpty && connectionStatus === 'CONNECTED' ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-black-50">
            <Bike size={40} className="opacity-30" />
            <p className="text-sm">No tienes pedidos asignados</p>
          </div>
        ) : (
          <div
            ref={carouselRef}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 px-1 h-full items-start"
            style={{ scrollbarWidth: 'none' }}
          >
            {enrichedOrders.map((order) => (
              <div
                key={order.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(order.id, el);
                  else cardRefs.current.delete(order.id);
                }}
                className="snap-center shrink-0 w-[85vw] max-w-sm"
              >
                <CourierOrderCard
                  order={order}
                  isSelected={selectedId === order.id}
                  onSelect={() => setSelectedId((prev) => (prev === order.id ? null : order.id))}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
