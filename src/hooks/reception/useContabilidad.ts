"use client";

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WorkerOrder } from '@/types/worker';
import { WorkerOrderService } from '@/services/workerOrderService';

export const useContabilidad = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<WorkerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (startDate: string, endDate: string, kitchenId: string) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const { body } = await WorkerOrderService.getOrdersByDay(token, startDate, endDate, kitchenId);
      const normalized = (body ?? []).map((o) => {
        const raw = o as WorkerOrder & { assignedCourierUserId?: string };
        if (!o.courierId && raw.assignedCourierUserId) {
          return { ...o, courierId: raw.assignedCourierUserId };
        }
        return o;
      });
      setOrders(normalized);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { orders, loading, error, fetchOrders };
};
