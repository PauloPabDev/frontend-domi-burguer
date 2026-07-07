"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { WorkerUser } from '@/types/worker';
import { useActiveCouriers } from '@/hooks/reception/useActiveCouriers';

interface CourierPanelContextValue {
  allCouriers: WorkerUser[];
  activeCouriers: WorkerUser[];
  toggleCourier: (id: string) => void;
  isActive: (id: string) => boolean;
  loading: boolean;
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  filterCourierIds: Set<string>;
  toggleFilterCourier: (id: string) => void;
  clearCourierFilter: () => void;
}

const CourierPanelContext = createContext<CourierPanelContextValue | null>(null);

export const CourierPanelProvider = ({ children }: { children: ReactNode }) => {
  const { allCouriers, activeCouriers, toggleCourier, isActive, loading } = useActiveCouriers();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [filterCourierIds, setFilterCourierIds] = useState<Set<string>>(new Set());

  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);

  const toggleFilterCourier = useCallback((id: string) => {
    setFilterCourierIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearCourierFilter = useCallback(() => setFilterCourierIds(new Set()), []);

  return (
    <CourierPanelContext.Provider
      value={{
        allCouriers, activeCouriers, toggleCourier, isActive, loading,
        isPanelOpen, openPanel, closePanel,
        filterCourierIds, toggleFilterCourier, clearCourierFilter,
      }}
    >
      {children}
    </CourierPanelContext.Provider>
  );
};

export const useCourierPanel = (): CourierPanelContextValue => {
  const ctx = useContext(CourierPanelContext);
  if (!ctx) throw new Error('useCourierPanel must be used within CourierPanelProvider');
  return ctx;
};
