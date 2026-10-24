import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import type { PushPayload } from "@/types/notifications";

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

self.addEventListener("push", (event) => {
  let payload: Partial<PushPayload> = {};
  try {
    payload = event.data?.json() ?? {};
  } catch {
    payload = { body: event.data?.text() };
  }

  // iOS/Safari exige mostrar una notificación por cada push, así que siempre hay título
  const options: NotificationOptions & { renotify?: boolean } = {
    body: payload.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    lang: "es",
    tag: payload.tag,
    // con el mismo tag, el estado nuevo reemplaza al anterior y vuelve a sonar
    renotify: Boolean(payload.tag),
    data: { url: payload.url ?? DEFAULT_NOTIFICATION_URL },
  };

  event.waitUntil(self.registration.showNotification(payload.title ?? "Domi Burguer", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const target = new URL(event.notification.data?.url ?? DEFAULT_NOTIFICATION_URL, self.location.origin);
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
