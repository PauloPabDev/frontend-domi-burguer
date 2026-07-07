"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';
import { useEnrichedOrders } from '@/hooks/useEnrichedOrders';
import { OrderKanbanColumn } from '@/components/recepcion/OrderKanbanColumn';
import { WorkerOrderService } from '@/services/workerOrderService';
import { OrderStatus } from '@/types/orders';

const KANBAN_STATUSES: OrderStatus[] = [
  'fresh',
  'preparing',
  'ready_for_pickup',
  'dispatched',
  'delivered',
  'pending_payment',
];

export default function RecepcionPage() {
  const { user } = useAuth();
  const { orders } = useSocket();
  const { kitchens } = useKitchenSelector();
  const enrichedOrders = useEnrichedOrders(orders, kitchens);

  const ordersByStatus = KANBAN_STATUSES.reduce<Record<string, typeof enrichedOrders>>(
    (acc, status) => {
      acc[status] = enrichedOrders.filter((o) => o.status === status);
      return acc;
    },
    {}
  );

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

  return (
    <div className="overflow-x-auto overflow-y-hidden -mb-4 h-[calc(100vh-106px)]">
      <div className="flex gap-3 min-w-max h-full">
        {KANBAN_STATUSES.map((status) => (
          <OrderKanbanColumn
            key={status}
            status={status}
            orders={ordersByStatus[status] ?? []}
            kitchens={kitchens}
            onStatusChange={handleStatusChange}
            onAssignCourier={handleAssignCourier}
            onAssignKitchen={handleAssignKitchen}
            onPaymentMethodChange={handlePaymentMethodChange}
            onMarkPaid={handleMarkPaid}
          />
        ))}
      </div>
    </div>
  );
}
