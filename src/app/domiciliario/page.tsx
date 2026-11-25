"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useEnrichedOrders } from '@/hooks/useEnrichedOrders';
import { CourierOrderCard } from '@/components/courier/CourierOrderCard';
import { CourierOrderCardSkeletonSlots } from '@/components/courier/CourierOrderCardSkeleton';
import { MultiMarkerMap, MapMarker } from '@/components/map/MultiMarkerMap';
import { CourierService } from '@/services/courierService';
import { OrderStatus } from '@/types/orders';
import { STATUS_CONFIG } from '@/types/worker';
import { Bike, Focus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCourierView, setCourierView } from '@/hooks/courier/useCourierView';
import { track } from '@/utils/analytics';

export default function DomiciliarioPage() {
  const { user } = useAuth();
  const { orders, connectionStatus, ordersReady } = useSocket();
  const enrichedOrders = useEnrichedOrders(orders);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const router = useRouter();
  // Hasta leer la preferencia no se pinta nada, para no mostrar la vista que se va a reemplazar
  const [viewChecked, setViewChecked] = useState(false);

  useEffect(() => {
    if (getCourierView() === 'focus') router.replace('/domiciliario/enfoque');
    else setViewChecked(true);
  }, [router]);

  const switchToFocus = () => {
    setCourierView('focus');
    track('courier_view_switch', { to: 'focus' });
    router.push('/domiciliario/enfoque');
  };

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
      if (window.innerWidth >= 1024) return;
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
      avatarUrl: o.client?.photoURL,
      clientName: o.client?.name,
    }));

  const selectedOrder = enrichedOrders.find((o) => o.id === selectedId);
  const selectedCenter = selectedOrder?.deliveryAddress?.coordinates;

  const handleStatusChange = async (orderId: string, prev: OrderStatus, next: OrderStatus) => {
    if (!user) return;
    const token = await user.getIdToken();
    await CourierService.changeStatus(token, orderId, prev, next);
  };

  const isEmpty = enrichedOrders.length === 0;
  // Con la conexión caída no se deja el skeleton para siempre
  const showSkeleton = !ordersReady && connectionStatus !== 'DISCONNECTED' && connectionStatus !== 'OFFLINE';

  if (!viewChecked) return null;

  return (
    <div className="h-full flex flex-col lg:flex-row py-3 gap-3">
      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-neutral-black-20 h-[45%] shrink-0 lg:h-full lg:flex-1">
        <button
          type="button"
          onClick={switchToFocus}
          className="absolute left-2 top-2 z-10 flex min-h-11 items-center gap-1.5 rounded-full bg-white/95 px-3 text-xs font-bold text-neutral-black-80 shadow-md"
        >
          <Focus size={16} />
          Vista enfocada
        </button>
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

      {/* Orders — carousel on mobile, vertical list on desktop */}
      <div className="flex-1 min-h-0 flex flex-col lg:w-[360px] lg:flex-none">
        {ordersReady && isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-black-50">
            <Bike size={40} className="opacity-30" />
            <p className="text-sm">No tienes pedidos asignados</p>
          </div>
        ) : (
          <div
            ref={carouselRef}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 px-1 h-full items-start lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:snap-none lg:pb-2 lg:px-0 lg:items-stretch"
            style={{ scrollbarWidth: 'none' }}
          >
            {showSkeleton && <CourierOrderCardSkeletonSlots />}
            {enrichedOrders.map((order) => (
              <div
                key={order.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(order.id, el);
                  else cardRefs.current.delete(order.id);
                }}
                className="snap-center shrink-0 w-[85vw] max-w-sm lg:w-full lg:max-w-none lg:shrink-0 lg:snap-align-none"
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
