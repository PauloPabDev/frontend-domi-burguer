"use client";

import { useEffect } from "react";
import { useConsentStore } from "@/store/consentStore";

const PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

type ClarityApi = typeof import("@microsoft/clarity").default;
let clarity: ClarityApi | null = null;

// Clarity solo se descarga e inicia si hay consentimiento, y en idle para no competir con el render.
export function ClarityLoader() {
  const analytics = useConsentStore((s) => s.analytics);

  useEffect(() => {
    if (!PROJECT_ID) return;

    if (analytics === true) {
      const start = () =>
        import("@microsoft/clarity").then(({ default: Clarity }) => {
          if (!clarity) Clarity.init(PROJECT_ID);
          clarity = Clarity;
          Clarity.consentV2({ ad_Storage: "denied", analytics_Storage: "granted" });
        });
      if ("requestIdleCallback" in window) {
        const id = window.requestIdleCallback(start, { timeout: 4000 });
        return () => window.cancelIdleCallback(id);
      }
      const t = setTimeout(start, 2000);
      return () => clearTimeout(t);
    }

    // Revocado: Clarity borra sus cookies (_clck/_clsk) y deja de grabar.
    if (analytics === false && clarity) clarity.consent(false);
  }, [analytics]);

  return null;
}
