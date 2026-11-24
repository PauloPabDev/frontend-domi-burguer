import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEnrichedOrders } from '@/hooks/useEnrichedOrders';
import { OrderService } from '@/services/orderService';
import { WorkerOrder, WorkerKitchen } from '@/types/worker';

/**
 * Carga una sola orden por ID para las páginas de detalle (recepción y admin) y la
 * enriquece igual que el tablero (cliente, domiciliario, dirección, nombres de productos).
 * `refresh` vuelve a pedirla sin mostrar el estado de carga: se llama tras cada acción.
 */
export function useWorkerOrder(orderId: string, kitchens: WorkerKitchen[]) {
  const { user } = useAuth();
  const [raw, setRaw] = useState<WorkerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await user.getIdToken();
        const { body } = await OrderService.getOrderById(orderId, token);
        if (cancelled) return;
        setRaw([body as unknown as WorkerOrder]);
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar la orden');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, orderId, version]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  const [order] = useEnrichedOrders(raw, kitchens);

  return { order: order ?? null, loading, error, refresh };
}
