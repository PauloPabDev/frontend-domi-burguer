'use client';

import { ToastProvider } from '@heroui/toast';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';

export type ToastPlacement =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

// Override manual de la posición (usado por /design/toasts para previsualizar).
// null = posición automática según la ruta.
let placementOverride: ToastPlacement | null = null;
const listeners = new Set<() => void>();

export function setToastPlacementOverride(placement: ToastPlacement | null) {
  placementOverride = placement;
  listeners.forEach((listener) => listener());
}

export function useToastPlacementOverride() {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => placementOverride,
    () => null,
  );
}

export function AppToastProvider() {
  const pathname = usePathname();
  const override = useToastPlacementOverride();
  const isRecepcion = pathname?.startsWith('/recepcion');

  const placement = override ?? (isRecepcion ? 'bottom-right' : 'top-right');
  const toastOffset = placement.startsWith('top') && !isRecepcion ? 100 : 20;

  return (
    <ToastProvider
      placement={placement}
      toastOffset={toastOffset}
      maxVisibleToasts={10}
    />
  );
}
