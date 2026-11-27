import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ConsentStore {
  /** null = el usuario aún no decidió (no se rastrea nada) */
  analytics: boolean | null;
  settingsOpen: boolean;
  setAnalytics: (value: boolean) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

export const useConsentStore = create<ConsentStore>()(
  persist(
    (set) => ({
      analytics: null,
      settingsOpen: false,
      setAnalytics: (analytics) => set({ analytics, settingsOpen: false }),
      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),
    }),
    {
      name: "cookie-consent",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ analytics: state.analytics }),
    },
  ),
);
