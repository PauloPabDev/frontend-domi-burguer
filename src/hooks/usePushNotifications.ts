"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationService } from "@/services/notificationService";
import { NotificationCategory, NotificationPreferences } from "@/types/notifications";
import {
    getPushRegistration,
    isIOS,
    isPushSupported,
    isStandalone,
    urlBase64ToUint8Array,
} from "@/utils/pushSupport";

/**
 * - unsupported: el navegador no soporta push
 * - needs-install: iOS solo permite push en la PWA instalada en la pantalla de inicio
 * - unavailable: el servidor no tiene las claves configuradas o el service worker no está activo
 * - ready: se puede activar
 */
export type PushAvailability = "checking" | "unsupported" | "needs-install" | "unavailable" | "ready";

const DEFAULT_PREFERENCES: NotificationPreferences = { functional: true, promotional: true };

export function usePushNotifications() {
    const { user } = useAuth();
    const [availability, setAvailability] = useState<PushAvailability>("checking");
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [deviceEnabled, setDeviceEnabled] = useState(false);
    const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estado inicial: soporte, permiso, suscripción de este dispositivo y preferencias de la cuenta
    useEffect(() => {
        if (!user) return;
        let cancelled = false;

        (async () => {
            if (!isPushSupported()) {
                if (!cancelled) setAvailability(isIOS() && !isStandalone() ? "needs-install" : "unsupported");
                return;
            }
            setPermission(Notification.permission);

            try {
                const [registration, publicKey, token] = await Promise.all([
                    getPushRegistration(),
                    NotificationService.getPublicKey(),
                    user.getIdToken(),
                ]);
                if (cancelled) return;

                if (!registration || !publicKey.enabled) {
                    setAvailability("unavailable");
                    return;
                }

                const [subscription, saved] = await Promise.all([
                    registration.pushManager.getSubscription(),
                    NotificationService.getPreferences(token),
                ]);
                if (cancelled) return;

                setDeviceEnabled(Boolean(subscription) && Notification.permission === "granted");
                setPreferences(saved);
                setAvailability("ready");
            } catch (err) {
                console.error("Error cargando notificaciones:", err);
                if (!cancelled) setAvailability("unavailable");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [user]);

    /** Devuelve true si el dispositivo quedó suscrito */
    const enableDevice = useCallback(async (): Promise<boolean> => {
        if (!user) return false;
        setBusy(true);
        setError(null);
        try {
            // requestPermission debe ejecutarse dentro del gesto del usuario (el clic en el interruptor)
            const result = await Notification.requestPermission();
            setPermission(result);
            if (result !== "granted") {
                setError("Bloqueaste las notificaciones. Actívalas desde los ajustes del navegador.");
                return false;
            }

            const registration = await getPushRegistration();
            const { enabled, publicKey } = await NotificationService.getPublicKey();
            if (!registration || !enabled || !publicKey) throw new Error("Notificaciones no disponibles");

            const applicationServerKey = urlBase64ToUint8Array(publicKey);
            let subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
                try {
                    subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
                } catch (err) {
                    // Quedó una suscripción hecha con otra clave VAPID: se descarta y se crea de nuevo
                    if (!(err instanceof DOMException) || err.name !== "InvalidStateError") throw err;
                    await (await registration.pushManager.getSubscription())?.unsubscribe();
                    subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
                }
            }

            await NotificationService.subscribe(subscription, await user.getIdToken());
            setDeviceEnabled(true);
            return true;
        } catch (err) {
            console.error("Error activando notificaciones:", err);
            setError("No pudimos activar las notificaciones. Intenta de nuevo.");
            return false;
        } finally {
            setBusy(false);
        }
    }, [user]);

    const disableDevice = useCallback(async () => {
        if (!user) return;
        setBusy(true);
        setError(null);
        try {
            const registration = await getPushRegistration();
            const subscription = await registration?.pushManager.getSubscription();
            if (subscription) {
                await NotificationService.unsubscribe(subscription.endpoint, await user.getIdToken());
                await subscription.unsubscribe();
            }
            setDeviceEnabled(false);
        } catch (err) {
            console.error("Error desactivando notificaciones:", err);
            setError("No pudimos desactivar las notificaciones. Intenta de nuevo.");
        } finally {
            setBusy(false);
        }
    }, [user]);

    const setCategory = useCallback(
        async (category: NotificationCategory, value: boolean) => {
            if (!user) return;
            setError(null);
            const previous = preferences;
            setPreferences({ ...preferences, [category]: value });
            try {
                setPreferences(await NotificationService.updatePreferences({ [category]: value }, await user.getIdToken()));
            } catch (err) {
                console.error("Error guardando preferencias:", err);
                setPreferences(previous);
                setError("No pudimos guardar el cambio. Intenta de nuevo.");
            }
        },
        [user, preferences]
    );

    return {
        availability,
        permission,
        deviceEnabled,
        preferences,
        busy,
        error,
        enableDevice,
        disableDevice,
        setCategory,
    };
}
