"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useActiveAnnouncements } from "@/hooks/useActiveAnnouncements";
import { Announcement } from "@/types/announcements";
import { announcementKey, getSeenKeys, markAnnouncementSeen } from "@/utils/seenAnnouncements";
import { track } from "@/utils/analytics";
import { AnnouncementModal } from "./AnnouncementModal";
import { isInternalHref } from "./AnnouncementCta";
import { showAnnouncementToast } from "./showAnnouncementToast";

// Pausa tras abrir la app, para no tapar la carga inicial ni los banners de instalación o inicio de sesión
const STARTUP_DELAY_MS = 3000;
// Pausa entre un aviso y el siguiente
const GAP_BETWEEN_MS = 1500;

// Flujos en los que un modal estorbaría (pago, inicio de sesión, verificación)
const MODAL_BLOCKED_ROUTES = ["/cart", "/login", "/verify-phone", "/thankyou", "/info-order"];
// En /avisos el usuario ya está leyendo los avisos: no se le repiten encima
const AUTO_SHOW_BLOCKED_ROUTES = ["/avisos"];

function isOnRoute(pathname: string, route: string): boolean {
  if (route === "/") return pathname === "/";
  return pathname === route || pathname.startsWith(`${route}/`);
}

function matchesRoute(announcement: Announcement, pathname: string): boolean {
  // sin rutas = todas las páginas públicas
  if (announcement.routes.length === 0) return true;
  return announcement.routes.some((route) => isOnRoute(pathname, route));
}

/**
 * Muestra al abrir la app los avisos vigentes que el dispositivo todavía no ha visto:
 * de a uno, primero los modales (por prioridad) y luego los toasts.
 * "Visto" se guarda en localStorage por id + versión del aviso.
 */
export function AnnouncementsHost() {
  const pathname = usePathname();
  const router = useRouter();
  const { announcements } = useActiveAnnouncements();

  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState<Announcement | null>(null);
  // Cambia después de cada toast para que el efecto evalúe el siguiente aviso
  const [cycle, setCycle] = useState(0);
  // Avisos ya sacados en esta sesión: evita repetirlos aunque el almacenamiento no esté disponible
  const handledRef = useRef(new Set<string>());
  const lastShownAtRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), STARTUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready || modal) return;
    if (AUTO_SHOW_BLOCKED_ROUTES.some((route) => isOnRoute(pathname, route))) return;

    const seen = getSeenKeys();
    const pending = announcements.filter((announcement) => {
      const key = announcementKey(announcement);
      return !seen.has(key) && !handledRef.current.has(key) && matchesRoute(announcement, pathname);
    });

    const modalsAllowed = !MODAL_BLOCKED_ROUTES.some((route) => isOnRoute(pathname, route));
    const next =
      (modalsAllowed ? pending.find((a) => a.display === "modal") : undefined) ??
      pending.find((a) => a.display === "toast");
    if (!next) return;

    const wait = Math.max(0, lastShownAtRef.current + GAP_BETWEEN_MS - Date.now());
    const timer = setTimeout(() => {
      handledRef.current.add(announcementKey(next));
      lastShownAtRef.current = Date.now();
      track("announcement_shown", { id: next.id, display: next.display });

      if (next.display === "modal") {
        // se marca como visto al cerrarlo: si la página se cierra con el modal abierto, volverá a salir
        setModal(next);
        return;
      }
      markAnnouncementSeen(next);
      showAnnouncementToast(next, {
        onCtaClick: () => track("announcement_clicked", { id: next.id, display: next.display }),
      });
      setCycle((c) => c + 1);
    }, wait);

    return () => clearTimeout(timer);
  }, [ready, modal, announcements, pathname, cycle]);

  const closeModal = () => {
    if (!modal) return;
    markAnnouncementSeen(modal);
    lastShownAtRef.current = Date.now();
    setModal(null);
  };

  const handleDismiss = () => {
    if (modal) track("announcement_dismissed", { id: modal.id });
    closeModal();
  };

  const handleCta = () => {
    if (!modal?.cta) return;
    const { href } = modal.cta;
    track("announcement_clicked", { id: modal.id, display: modal.display });
    closeModal();
    if (isInternalHref(href)) {
      router.push(href);
    } else {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  if (!modal) return null;

  return <AnnouncementModal announcement={modal} open onClose={handleDismiss} onCta={handleCta} />;
}
