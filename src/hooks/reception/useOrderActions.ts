import { useAuth } from '@/contexts/AuthContext';
import { WorkerOrderService } from '@/services/workerOrderService';
import { OrderStatus } from '@/types/orders';
import { PaymentChange } from '@/types/paymentChangeRequest';
import { notify } from '@/utils/notify';

/**
 * Acciones sobre una orden para las páginas de detalle. Cada una avisa el error con un
 * toast, lo relanza (las cards muestran su propio estado de carga) y llama a `onDone`
 * al terminar bien para recargar la orden (salvo al cancelarla: la página navega a otro lado).
 */
export function useOrderActions(onDone: () => void) {
  const { user } = useAuth();

  const run = async <T,>(errorTitle: string, fn: (token: string) => Promise<T>, successTitle?: [string, string?], reload = true) => {
    if (!user) return;
    try {
      await fn(await user.getIdToken());
      if (successTitle) notify.success(...successTitle);
      if (reload) onDone();
    } catch (e) {
      notify.error(errorTitle, e instanceof Error ? e.message : undefined);
      throw e;
    }
  };

  return {
    onStatusChange: (id: string, prev: OrderStatus, next: OrderStatus) =>
      run('Error al cambiar estado', (t) => WorkerOrderService.changeStatus(t, id, prev, next)),
    onAssignCourier: (id: string, courierId: string | null) =>
      run('Error al asignar domiciliario', (t) => WorkerOrderService.assignCourier(t, id, courierId)),
    onAssignKitchen: (id: string, kitchenId: string) =>
      run('Error al asignar cocina', (t) => WorkerOrderService.assignKitchen(t, id, kitchenId), ['Cocina actualizada']),
    onPaymentMethodChange: (id: string, prevMethod: string, method: string) =>
      run('Error al cambiar método de pago', (t) => WorkerOrderService.updatePaymentMethod(t, id, prevMethod, method)),
    onMarkPaid: (id: string) =>
      run('Error al registrar pago', (t) => WorkerOrderService.markPaid(t, id), ['Pago confirmado']),
    onAdminPaymentChange: (id: string, prevMethod: string, change: PaymentChange) =>
      run('Error al corregir el pago', (t) => WorkerOrderService.adminChangePayment(t, id, prevMethod, change), ['Pago corregido']),
    onDelete: (id: string) =>
      run('Error al cancelar orden', (t) => WorkerOrderService.deleteOrder(t, id), ['Orden cancelada', 'La orden fue eliminada correctamente.'], false),
  };
}
