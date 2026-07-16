"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';
import { useEnrichedOrders } from '@/hooks/useEnrichedOrders';
import { useCourierPanel } from '@/contexts/CourierPanelContext';
import { OrderKanbanColumn } from '@/components/recepcion/OrderKanbanColumn';
import { CourierFilterPanel } from '@/components/recepcion/CourierFilterPanel';
import { WorkerOrderService } from '@/services/workerOrderService';
import { OrderStatus } from '@/types/orders';
import { notify } from '@/utils/notify';

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
  const { filterCourierIds } = useCourierPanel();
  const enrichedOrders = useEnrichedOrders(orders, kitchens);

  const filteredOrders =
    filterCourierIds.size === 0
      ? enrichedOrders
      : enrichedOrders.filter((o) => o.courierId && filterCourierIds.has(o.courierId));

  const ordersByStatus = KANBAN_STATUSES.reduce<Record<string, typeof enrichedOrders>>(
    (acc, status) => {
      acc[status] = filteredOrders.filter((o) => o.status === status);
      return acc;
    },
    {}
  );

  const handleStatusChange = async (orderId: string, prev: OrderStatus, next: OrderStatus) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await WorkerOrderService.changeStatus(token, orderId, prev, next);
    } catch (e) {
      notify.error('Error al cambiar estado', e instanceof Error ? e.message : undefined);
      throw e;
    }
  };

  const handleAssignCourier = async (orderId: string, courierId: string | null) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await WorkerOrderService.assignCourier(token, orderId, courierId);
    } catch (e) {
      notify.error('Error al asignar domiciliario', e instanceof Error ? e.message : undefined);
      throw e;
    }
  };

  const handleAssignKitchen = async (orderId: string, kitchenId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await WorkerOrderService.assignKitchen(token, orderId, kitchenId);
      notify.success('Cocina actualizada', 'La cocina fue asignada correctamente.');
    } catch (e) {
      notify.error('Error al asignar cocina', e instanceof Error ? e.message : undefined);
      throw e;
    }
  };

  const handlePaymentMethodChange = async (orderId: string, previousMethod: string, method: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await WorkerOrderService.updatePaymentMethod(token, orderId, previousMethod, method);
    } catch (e) {
      notify.error('Error al cambiar método de pago', e instanceof Error ? e.message : undefined);
      throw e;
    }
  };

  const handleMarkPaid = async (orderId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await WorkerOrderService.markPaid(token, orderId);
    } catch (e) {
      notify.error('Error al registrar pago', e instanceof Error ? e.message : undefined);
      throw e;
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await WorkerOrderService.deleteOrder(token, orderId);
      notify.success('Orden cancelada', 'La orden fue eliminada correctamente.');
    } catch (e) {
      notify.error('Error al cancelar orden', e instanceof Error ? e.message : undefined);
      throw e;
    }
  };

  return (
    <div className="-mb-4 h-[calc(100vh-106px)] flex flex-col gap-2">
      <CourierFilterPanel />
      <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0">
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
              onDelete={handleDeleteOrder}
              onPaymentMethodChange={handlePaymentMethodChange}
              onMarkPaid={handleMarkPaid}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
