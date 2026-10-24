"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutList, Rows3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useEnrichedOrders } from '@/hooks/useEnrichedOrders';
import { useCourierPanel } from '@/contexts/CourierPanelContext';
import { usePaymentChangeRequest } from '@/hooks/reception/usePaymentChangeRequest';
import { OrderKanbanColumn, KANBAN_COLUMN_WIDTH } from '@/components/recepcion/OrderKanbanColumn';
import { RecepcionOrderList } from '@/components/recepcion/RecepcionOrderList';
import { CourierFilterPanel } from '@/components/recepcion/CourierFilterPanel';
import { WorkerOrderService } from '@/services/workerOrderService';
import { OrderStatus } from '@/types/orders';
import { PaymentChange } from '@/types/paymentChangeRequest';
import { notify } from '@/utils/notify';
import { cn } from '@/lib/utils';

const COMPACT_VIEW_KEY = 'domi_recepcion_compact_view';

const KANBAN_STATUSES: OrderStatus[] = [
  'fresh',
  'preparing',
  'ready_for_pickup',
  'dispatched',
  'delivered',
  'pending_payment',
];

const KANBAN_GAP = 8; // gap-2 entre columnas
const KANBAN_FULL_WIDTH =
  KANBAN_STATUSES.length * KANBAN_COLUMN_WIDTH + (KANBAN_STATUSES.length - 1) * KANBAN_GAP;

export default function RecepcionPage() {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const { orders } = useSocket();
  const { kitchens } = useKitchenSelector();
  const { filterCourierIds } = useCourierPanel();
  const enrichedOrders = useEnrichedOrders(orders, kitchens);
  const handleRequestPaymentChange = usePaymentChangeRequest();
  // Recepción cobra como siempre (elige el método mientras el pago no esté aprobado y lo
  // aprueba). Las correcciones (método con el pago aprobado, otros estados) las aplica un
  // admin; recepción se las pide con una solicitud.
  const isAdmin = userProfile?.roles?.includes('admin') ?? false;

  // Vista simple: preferencia por navegador. Se lee tras montar para no romper la hidratación.
  const [compactView, setCompactView] = useState(false);
  useEffect(() => {
    try {
      setCompactView(localStorage.getItem(COMPACT_VIEW_KEY) === '1');
    } catch {
      // Almacenamiento bloqueado: se queda la vista completa
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

  const filteredOrders =
    filterCourierIds.size === 0
      ? enrichedOrders
      : enrichedOrders.filter((o) => o.courierId && filterCourierIds.has(o.courierId));

  // Ancho disponible del tablero: si las columnas no caben, las vacías se colapsan
  const [boardWidth, setBoardWidth] = useState<number | null>(null);
  const boardObserver = useRef<ResizeObserver | null>(null);
  const boardRef = useCallback((el: HTMLDivElement | null) => {
    boardObserver.current?.disconnect();
    boardObserver.current = null;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setBoardWidth(entry.contentRect.width));
    observer.observe(el);
    boardObserver.current = observer;
  }, []);
  const collapseEmptyColumns = boardWidth !== null && boardWidth < KANBAN_FULL_WIDTH;

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

  // Los errores los muestra el modal de corrección
  const handleAdminPaymentChange = async (orderId: string, previousMethod: string, change: PaymentChange) => {
    if (!user) return;
    const token = await user.getIdToken();
    await WorkerOrderService.adminChangePayment(token, orderId, previousMethod, change);
    notify.success('Pago corregido', 'El cambio quedó registrado en el historial del pedido.');
  };

  const paymentHandlers = {
    onPaymentMethodChange: handlePaymentMethodChange,
    ...(isAdmin
      ? { onAdminPaymentChange: handleAdminPaymentChange }
      : { onRequestPaymentChange: handleRequestPaymentChange }),
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
    // Alto exacto del viewport: main aporta mt-[100px] + py-4 (16px arriba) y
    // el -mb-4 anula su padding inferior → 100 + 16 = 116px. Si no cuadra,
    // aparece un scroll de página. dvh evita el sobrante de la barra del navegador en móvil.
    <div className="-mb-4 h-[calc(100dvh-116px)] flex flex-col gap-2">
      <div className="flex items-start gap-2 shrink-0">
        <CourierFilterPanel className="flex-1 min-w-0" />
        <button
          type="button"
          onClick={toggleCompactView}
          aria-pressed={compactView}
          title={compactView ? 'Ver cards completas' : 'Simplificar cards'}
          className={cn(
            'ml-auto flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all shrink-0',
            compactView
              ? 'bg-neutral-black-80 text-white border-transparent'
              : 'bg-white text-neutral-black-60 border-neutral-black-20 hover:border-neutral-black-40'
          )}
        >
          {compactView ? <Rows3 size={13} /> : <LayoutList size={13} />}
          {compactView ? 'Vista completa' : 'Vista simple'}
        </button>
      </div>
      {compactView ? (
        // Vista simple: una sola lista (sin columnas) que aprovecha todo el ancho
        <div className="flex-1 min-h-0">
          <RecepcionOrderList
            orders={filteredOrders}
            kitchens={kitchens}
            onStatusChange={handleStatusChange}
            onAssignCourier={handleAssignCourier}
            onAssignKitchen={handleAssignKitchen}
            onDelete={handleDeleteOrder}
            onMarkPaid={handleMarkPaid}
            {...paymentHandlers}
          />
        </div>
      ) : (
        <div ref={boardRef} className="flex-1 overflow-x-auto overflow-y-hidden min-h-0">
          <div className="flex gap-2 min-w-max h-full">
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
                onMarkPaid={handleMarkPaid}
                {...paymentHandlers}
                collapsed={collapseEmptyColumns}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
