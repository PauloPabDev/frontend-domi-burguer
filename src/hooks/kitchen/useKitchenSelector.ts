"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WorkerKitchen } from '@/types/worker';
import { WorkerOrderService } from '@/services/workerOrderService';

const STORAGE_KEY = 'domi_kitchen_id';

export const useKitchenSelector = () => {
  const { user } = useAuth();
  const [kitchens, setKitchens] = useState<WorkerKitchen[]>([]);
  const [selectedKitchenId, setSelectedKitchenId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKitchens = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const { body } = await WorkerOrderService.getKitchensList(token);
        setKitchens(body ?? []);
      } catch {
        setKitchens([]);
      } finally {
        setLoading(false);
      }
    };
    fetchKitchens();
  }, [user]);

  const selectKitchen = useCallback((id: string | null) => {
    setSelectedKitchenId(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const selectedKitchen = kitchens.find((k) => k.id === selectedKitchenId) ?? null;

  return { kitchens, selectedKitchenId, selectedKitchen, selectKitchen, loading };
};
