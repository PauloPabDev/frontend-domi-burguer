"use client";

import { RefObject, useEffect, useSyncExternalStore } from 'react';

// Mismos cortes que Tailwind: md, lg, xl, 2xl
const QUERIES = [768, 1024, 1280, 1536].map((w) => `(min-width:${w}px)`);

function subscribe(cb: () => void) {
  const mqs = QUERIES.map((q) => window.matchMedia(q));
  mqs.forEach((m) => m.addEventListener('change', cb));
  return () => mqs.forEach((m) => m.removeEventListener('change', cb));
}

/** 0 = móvil, 1 = md, 2 = lg, 3 = xl, 4 = 2xl. */
export const useNavTier = () =>
  useSyncExternalStore(
    subscribe,
    () => QUERIES.filter((q) => window.matchMedia(q).matches).length,
    () => 1,
  );

/** Cierra un panel con clic/toque fuera (pointerdown) o con Escape; `viaKeyboard` permite devolver el foco al botón. */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: (viaKeyboard: boolean) => void,
) {
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(true);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, open, onClose]);
}
