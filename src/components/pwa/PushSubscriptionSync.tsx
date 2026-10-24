"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationService } from "@/services/notificationService";
import { getPushRegistration, isPushSupported } from "@/utils/pushSupport";

/**
 * Mantiene la suscripción push de este dispositivo ligada al usuario que tiene la sesión abierta.
 * - Al iniciar sesión: si el dispositivo ya tenía permiso y suscripción, la registra a nombre del usuario actual
 *   (así, si otra persona usa el mismo celular, las notificaciones dejan de llegarle a la anterior).
 * - Al cerrar sesión: la quita del usuario anterior (el permiso del navegador se conserva).
 */
export function PushSubscriptionSync() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user || !isPushSupported() || Notification.permission !== "granted") return;
        let cancelled = false;

        (async () => {
            try {
                const registration = await getPushRegistration();
                const subscription = await registration?.pushManager.getSubscription();
                if (!subscription || cancelled) return;
                await NotificationService.subscribe(subscription, await user.getIdToken());
            } catch (err) {
                console.error("Error sincronizando notificaciones:", err);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [user]);

    return null;
}
