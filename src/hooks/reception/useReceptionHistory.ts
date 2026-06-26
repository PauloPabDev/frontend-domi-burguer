"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WorkerOrder } from '@/types/worker';
import { WorkerOrderService } from '@/services/workerOrderService';

export const useReceptionHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<WorkerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const now = new Date();
      const startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      const { body } = await WorkerOrderService.getOrdersByDay(
        token,
        startDate.toISOString(),
        endDate.toISOString()
      );
      setOrders(body ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar historial');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);
  const totalDeliveryRevenue = orders.reduce((sum, o) => sum + (o.deliveryPrice ?? 0), 0);

  return { orders, loading, error, refetch: fetchHistory, totalRevenue, totalDeliveryRevenue };
};
