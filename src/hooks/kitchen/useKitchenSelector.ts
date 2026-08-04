"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { WorkerKitchen } from '@/types/worker';
import { WorkerOrderService } from '@/services/workerOrderService';

const STORAGE_KEY = 'domi_kitchen_id';

export const useKitchenSelector = () => {
  const { user } = useAuth();
  const { userProfile, loading: profileLoading } = useUserProfile();
  const [allKitchens, setAllKitchens] = useState<WorkerKitchen[]>([]);
  const [selectedKitchenId, setSelectedKitchenId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  });
  const [kitchensLoading, setKitchensLoading] = useState(true);

  useEffect(() => {
    const fetchKitchens = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const { body } = await WorkerOrderService.getKitchensList(token);
        setAllKitchens(body ?? []);
      } catch {
        setAllKitchens([]);
      } finally {
        setKitchensLoading(false);
      }
    };
    fetchKitchens();
  }, [user]);

  const isAdmin = userProfile?.roles?.includes('admin') ?? false;

  // Los trabajadores solo pueden ver/operar las cocinas que tienen asignadas.
  // Los admins ven todas (necesario para /admin/cocinas y la asignación de cocinas a usuarios).
  const kitchens = useMemo(() => {
    if (isAdmin) return allKitchens;
    const assigned = userProfile?.assignedKitchens;
    if (!assigned) return [];
    return allKitchens.filter((k) => assigned.includes(k.id));
  }, [allKitchens, isAdmin, userProfile]);

  const loading = kitchensLoading || profileLoading;

  const selectKitchen = useCallback((id: string | null) => {
    setSelectedKitchenId(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Si la cocina seleccionada (p.ej. persistida de una sesión previa) ya no
  // está entre las cocinas permitidas, se limpia la selección.
  useEffect(() => {
    if (loading) return;
    if (selectedKitchenId && !kitchens.some((k) => k.id === selectedKitchenId)) {
      selectKitchen(null);
    }
  }, [loading, kitchens, selectedKitchenId, selectKitchen]);

  const selectedKitchen = kitchens.find((k) => k.id === selectedKitchenId) ?? null;

  return { kitchens, selectedKitchenId, selectedKitchen, selectKitchen, loading };
};
