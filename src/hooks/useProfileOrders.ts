import { useCallback, useEffect, useState } from 'react';
import { Order } from '@/types/orders';
import { OrderService } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';

export function useProfileOrders(limit: number) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await user.getIdToken();
        const response = await OrderService.getUserOrders(token, { page: 1, limit });
        if (cancelled) return;

        const batch = response.body || [];
        setOrders(batch);
        setPage(1);
        setHasMore(batch.length === limit);
      } catch (err) {
        if (cancelled) return;
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar los pedidos';
        setError(errorMessage);
        console.error('Error fetching profile orders:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, limit]);

  const loadMore = useCallback(async () => {
    if (!user || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const token = await user.getIdToken();
      const nextPage = page + 1;
      const response = await OrderService.getUserOrders(token, { page: nextPage, limit });
      const batch = response.body || [];

      setOrders((prev) => [...prev, ...batch]);
      setPage(nextPage);
      setHasMore(batch.length === limit);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar más pedidos';
      setError(errorMessage);
      console.error('Error loading more profile orders:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [user, page, limit, loadingMore, hasMore]);

  return { orders, loading, loadingMore, error, hasMore, loadMore };
}
