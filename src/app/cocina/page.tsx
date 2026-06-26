"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';
import { KitchenOrderCard } from '@/components/cocina/KitchenOrderCard';
import { KitchenSelector } from '@/components/cocina/KitchenSelector';
import { WorkerOrderService } from '@/services/workerOrderService';
import { OrderStatus } from '@/types/orders';
import { ChefHat } from 'lucide-react';

export default function CocinaPage() {
  const { user } = useAuth();
  const { orders, connectionStatus } = useSocket();
  const { kitchens, selectedKitchenId, selectKitchen, changeKitchen, loading } = useKitchenSelectorWithSocket();

  const activeOrders = orders.filter(
    (o) => o.status === 'fresh' || o.status === 'preparing'
  );

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
      {connectionStatus === 'CONNECTING' && (
        <p className="text-sm text-center text-neutral-black-50 animate-pulse">Conectando...</p>
      )}

      {activeOrders.length === 0 && connectionStatus === 'CONNECTED' ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-black-50">
          <ChefHat size={48} className="opacity-30" />
          <p className="text-sm">No hay pedidos activos en tu cocina</p>
        </div>
      ) : (
        activeOrders.map((order) => (
          <KitchenOrderCard
            key={order.id}
            order={order}
            onStatusChange={handleStatusChange}
          />
        ))
      )}
    </div>
  );
}

function useKitchenSelectorWithSocket() {
  const { changeKitchen } = useSocket();
  const selector = useKitchenSelector();
  return { ...selector, changeKitchen };
}
