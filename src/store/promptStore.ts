import { create } from "zustand";

// Orden en que aparecen los avisos flotantes: uno por vez, de menos a más "extra".
export const PROMPT_ORDER = ["cookies", "signin", "install"] as const;
export type PromptId = (typeof PROMPT_ORDER)[number];

interface PromptStore {
  /** Cada aviso informa si ahora mismo le corresponde mostrarse. */
  eligible: Partial<Record<PromptId, boolean>>;
  /** El aviso visible (máximo uno). */
  current: PromptId | null;
  /** Cuántos se han mostrado en esta visita, para espaciar el primero del resto. */
  shown: number;
  setEligible: (id: PromptId, value: boolean) => void;
  setCurrent: (id: PromptId | null) => void;
}

export const usePromptStore = create<PromptStore>()((set) => ({
  eligible: {},
  current: null,
  shown: 0,
  setEligible: (id, value) =>
    set((s) => (!!s.eligible[id] === value ? s : { eligible: { ...s.eligible, [id]: value } })),
  setCurrent: (current) => set((s) => ({ current, shown: current ? s.shown + 1 : s.shown })),
}));
