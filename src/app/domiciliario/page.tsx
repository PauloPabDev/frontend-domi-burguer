"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { CourierOrderCard } from '@/components/courier/CourierOrderCard';
import { MultiMarkerMap, MapMarker } from '@/components/map/MultiMarkerMap';
import { CourierService } from '@/services/courierService';
import { OrderStatus } from '@/types/orders';
import { Bike } from 'lucide-react';

export default function DomiciliarioPage() {
  const { user } = useAuth();
  const { orders, connectionStatus } = useSocket();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const markers: MapMarker[] = orders
    .filter((o) => o.deliveryAddress?.coordinates)
    .map((o) => ({
      id: o.id,
      position: o.deliveryAddress.coordinates,
      label: String(o.dailyOrderNumber),
    }));

  const selectedOrder = orders.find((o) => o.id === selectedId);
  const selectedCenter = selectedOrder?.deliveryAddress?.coordinates;

  const handleStatusChange = async (orderId: string, prev: OrderStatus, next: OrderStatus) => {
    if (!user) return;
    const token = await user.getIdToken();
    await CourierService.changeStatus(token, orderId, prev, next);
  };

  const isEmpty = orders.length === 0;

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

      {/* Orders list — scrollable in remaining space */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {connectionStatus === 'CONNECTING' && (
          <p className="text-sm text-center text-neutral-black-50 animate-pulse py-4">Conectando...</p>
        )}

        {isEmpty && connectionStatus === 'CONNECTED' ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-black-50">
            <Bike size={40} className="opacity-30" />
            <p className="text-sm">No tienes pedidos asignados</p>
          </div>
        ) : (
          <div className="space-y-3 pb-3">
            {orders.map((order) => (
              <CourierOrderCard
                key={order.id}
                order={order}
                isSelected={selectedId === order.id}
                onSelect={() => setSelectedId((prev) => (prev === order.id ? null : order.id))}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
