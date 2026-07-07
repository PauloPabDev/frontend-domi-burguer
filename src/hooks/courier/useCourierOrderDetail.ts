import { useState, useEffect } from 'react';
import { CourierOrder } from '@/types/courier';
import { CourierService } from '@/services/courierService';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

export const useCourierOrderDetail = (orderId: string) => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const [order, setOrder] = useState<CourierOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !userProfile?.id) return;

    const fetchDetail = async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      try {
        setLoading(true);
        setError(null);
        const token = await user.getIdToken();
        const result = await CourierService.getHistory(
          token,
          userProfile.id,
          start.toUTCString(),
          end.toUTCString(),
        );
        const found = (result.body ?? []).find((o) => o.id === orderId) ?? null;
        setOrder(found);
        if (!found) setError('Pedido no encontrado');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile?.id, orderId]);

  return { order, loading, error };
};
