"use client";

import { useState, useEffect, useCallback } from 'react';
import { useCouriers } from './useCouriers';

const STORAGE_KEY = 'domiburguer:active_couriers';

const loadActiveIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
};

const saveActiveIds = (ids: Set<string>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
};

export const useActiveCouriers = () => {
  const { couriers, loading } = useCouriers();
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setActiveIds(loadActiveIds());
  }, []);

  const toggleCourier = useCallback((id: string) => {
    setActiveIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveActiveIds(next);
      return next;
    });
  }, []);

  const isActive = useCallback((id: string) => activeIds.has(id), [activeIds]);

  const activeCouriers = couriers.filter((c) => activeIds.has(c.id));

  return { allCouriers: couriers, activeCouriers, toggleCourier, isActive, loading };
};
