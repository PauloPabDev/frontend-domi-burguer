import { useState, useEffect } from 'react';
import { CourierOrder, CourierStats } from '@/types/courier';
import { CourierService } from '@/services/courierService';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

export const useCourierHistory = () => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const [orders, setOrders] = useState<CourierOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user || !userProfile?.id) return;

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
        end.toUTCString()
      );
      setOrders(result.body ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.id]);

  const stats: CourierStats = {
    earnings: orders.reduce((sum, o) => sum + (o.deliveryPrice ?? 0), 0),
    deliveries: orders.length,
    totalDistance: orders.reduce((sum, o) => sum + (o.distance ?? 0), 0),
  };

  return { orders, stats, loading, error, refetch: fetchHistory };
};
