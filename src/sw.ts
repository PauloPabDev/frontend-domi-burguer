import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { CAMPAIGN_CLICK_PARAM, type PushPayload } from "@/types/notifications";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

// ─── Notificaciones push ─────────────────────────────────────────────────────

const DEFAULT_NOTIFICATION_URL = "/";
const PROMOTIONS_OFF_ACTION = "promotions-off";
const PROMOTIONS_SETTINGS_URL = "/profile#notificaciones";

self.addEventListener("push", (event) => {
  let payload: Partial<PushPayload> = {};
  try {
    payload = event.data?.json() ?? {};
  } catch {
    payload = { body: event.data?.text() };
  }

  // iOS/Safari exige mostrar una notificación por cada push, así que siempre hay título
  const options: NotificationOptions & {
    renotify?: boolean;
    image?: string;
    actions?: { action: string; title: string }[];
  } = {
    body: payload.body,
    icon: "/icons/icon-192x192.png",
    // Android solo usa el canal alfa del badge: silueta blanca sobre transparente
    badge: "/icons/badge-96x96.png",
    image: payload.image,
    lang: "es",
    tag: payload.tag,
    // con el mismo tag, el estado nuevo reemplaza al anterior y vuelve a sonar
    renotify: Boolean(payload.tag),
    // es publicidad: se puede apagar desde la misma notificación (iOS no muestra acciones)
    actions: payload.category === "promotional" ? [{ action: PROMOTIONS_OFF_ACTION, title: "No recibir promociones" }] : undefined,
    data: { url: payload.url ?? DEFAULT_NOTIFICATION_URL, campaignId: payload.campaignId },
  };

  event.waitUntil(self.registration.showNotification(payload.title ?? "Domi Burguer", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { url: dataUrl, campaignId } = event.notification.data ?? {};
  const turningOffPromotions = event.action === PROMOTIONS_OFF_ACTION;
  const target = new URL(turningOffPromotions ? PROMOTIONS_SETTINGS_URL : (dataUrl ?? DEFAULT_NOTIFICATION_URL), self.location.origin);
  // la página cuenta el clic (el service worker no conoce la URL de la API); apagar promociones no es un clic
  if (campaignId && !turningOffPromotions) target.searchParams.set(CAMPAIGN_CLICK_PARAM, campaignId);
  // solo rutas de nuestro propio sitio
  const url = target.origin === self.location.origin ? target.href : self.location.origin;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const open = windows.find((client) => new URL(client.url).origin === self.location.origin);
      if (open) {
        await open.focus();
        if ("navigate" in open) await (open as WindowClient).navigate(url);
        return;
      }
      await self.clients.openWindow(url);
    })()
  );
});
