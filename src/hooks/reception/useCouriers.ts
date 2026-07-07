"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WorkerUser } from '@/types/worker';
import { WorkerOrderService } from '@/services/workerOrderService';

export const useCouriers = () => {
  const { user } = useAuth();
  const [couriers, setCouriers] = useState<WorkerUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const { body } = await WorkerOrderService.getCouriersList(token, { page: '1', limit: '100' });
        console.log('Fetched couriers:', body);

        setCouriers(body ?? []);
      } catch {
        setCouriers([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  return { couriers, loading };
};
