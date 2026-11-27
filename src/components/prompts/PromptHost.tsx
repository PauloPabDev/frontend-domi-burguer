"use client";

import { useEffect } from "react";
import { PROMPT_ORDER, usePromptStore } from "@/store/promptStore";
import { trackPrompt } from "@/utils/analytics";
import { CookieConsent } from "@/components/consent/CookieConsent";
import { GoogleSignInBanner } from "@/components/auth/GoogleSignInBanner";
import { InstallBanner } from "@/components/pwa/InstallBanner";

const FIRST_DELAY_MS = 2500; // deja cargar la página antes del primer aviso
const GAP_MS = 1500; // pausa entre un aviso y el siguiente

/** Único dueño del turno: muestra un aviso por vez en el orden de PROMPT_ORDER. */
export function PromptHost() {
  const { eligible, current, shown, setCurrent } = usePromptStore();
  const next = PROMPT_ORDER.find((id) => eligible[id]) ?? null;

  useEffect(() => {
    if (current && !eligible[current]) return setCurrent(null); // cerrado o ya no aplica
    if (current || !next) return;
    const t = setTimeout(() => setCurrent(next), shown === 0 ? FIRST_DELAY_MS : GAP_MS);
    return () => clearTimeout(t);
  }, [current, next, eligible, shown, setCurrent]);

  useEffect(() => {
    if (current) trackPrompt(current, "shown");
  }, [current]);

  return (
    <>
      <CookieConsent />
      <GoogleSignInBanner />
      <InstallBanner />
    </>
  );
}
