"use client";

import { useCallback, useEffect, useState } from "react";
import { usePromptStore, type PromptId } from "@/store/promptStore";

/** Registra si el aviso quiere mostrarse y devuelve si es su turno. */
export function usePromptSlot(id: PromptId, eligible: boolean): boolean {
  const setEligible = usePromptStore((s) => s.setEligible);
  useEffect(() => {
    setEligible(id, eligible);
    return () => setEligible(id, false);
  }, [id, eligible, setEligible]);
  return usePromptStore((s) => s.current === id);
}

/** Descarte recordado en localStorage por N días. Empieza en «descartado» para no parpadear en SSR. */
export function useDismissal(key: string, days: number) {
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    const at = parseInt(localStorage.getItem(key) ?? "", 10);
    setDismissed(!Number.isNaN(at) && Date.now() - at < days * 86_400_000);
  }, [key, days]);
  const dismiss = useCallback(() => {
    localStorage.setItem(key, String(Date.now()));
    setDismissed(true);
  }, [key]);
  return [dismissed, dismiss] as const;
}
