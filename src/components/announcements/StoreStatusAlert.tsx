"use client";

import { useEffect, useRef } from "react";
import { useKitchensStatus } from "@/hooks/kitchen/useKitchensStatus";
import { formatOpensAt, getKitchenStatusLabel } from "@/utils/kitchenStatusLabel";
import { showAnnouncementToast } from "./showAnnouncementToast";

// Misma pausa de arranque que los avisos, para no pisar la carga inicial ni los banners
const STARTUP_DELAY_MS = 3500;

type AlertKind = "closed" | "closing";

/**
 * Alerta (toast) solo en dos casos, una vez por cambio de estado:
 * - todas las cocinas cerradas → «En este momento estamos cerrados. Abriremos hoy/mañana/el lunes a las X»
 * - todas las cocinas abiertas están por cerrar (≤ 10 min) → «Estamos a punto de cerrar. ¡Pide ahora!»
 */
export function StoreStatusAlert() {
  const { statuses, nowMs } = useKitchensStatus();
  const shownRef = useRef<AlertKind | null>(null);
  // Hora del servidor para decir hoy/mañana, sin que cada tick re-dispare el efecto
  const nowMsRef = useRef(nowMs);
  nowMsRef.current = nowMs;

  const open = statuses.filter((s) => s.open === true);
  const allClosed = statuses.length > 0 && statuses.every((s) => s.open === false);
  const allClosing =
    open.length > 0 && open.every((s) => getKitchenStatusLabel(s, nowMs).tone === "warning");

  const kind: AlertKind | null = allClosed ? "closed" : allClosing ? "closing" : null;

  // Próxima apertura entre las cocinas (la más cercana)
  const nextOpensAt = statuses
    .map((s) => s.opensAt)
    .filter((d): d is string => !!d)
    .sort()[0];

  useEffect(() => {
    // Si el estado cambia (p. ej. vuelve a abrir), se permite volver a avisar la próxima vez
    if (!kind) {
      shownRef.current = null;
      return;
    }
    if (shownRef.current === kind) return;

    const timer = setTimeout(() => {
      shownRef.current = kind;
      if (kind === "closed") {
        showAnnouncementToast({
          variant: "warning",
          title: "En este momento estamos cerrados",
          body: nextOpensAt
            ? `Abriremos ${formatOpensAt(new Date(nextOpensAt), new Date(nowMsRef.current))}.`
            : "Vuelve pronto.",
          cta: null,
          dismissible: true,
        });
      } else {
        showAnnouncementToast({
          variant: "warning",
          title: "Estamos a punto de cerrar",
          body: "¡Pide ahora!",
          cta: { label: "PEDIR AHORA", href: "/#productos" },
          dismissible: true,
        });
      }
    }, STARTUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, [kind, nextOpensAt]);

  return null;
}
