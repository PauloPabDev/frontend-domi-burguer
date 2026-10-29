"use client";

import { useEffect } from "react";
import { NotificationService } from "@/services/notificationService";
import { CAMPAIGN_CLICK_PARAM } from "@/types/notifications";

/**
 * Cuenta el clic de una promoción push. El service worker abre la página con ?nc=<campaña>
 * (él no conoce la URL de la API); aquí se registra y se quita el parámetro de la barra de direcciones.
 */
export function PushCampaignClickTracker() {
    useEffect(() => {
        const url = new URL(window.location.href);
        const campaignId = url.searchParams.get(CAMPAIGN_CLICK_PARAM);
        if (!campaignId) return;

        url.searchParams.delete(CAMPAIGN_CLICK_PARAM);
        // conserva el estado de Next.js en el history para no romper la navegación hacia atrás
        window.history.replaceState(window.history.state, "", url.href);
        NotificationService.trackCampaignClick(campaignId);
    }, []);

    return null;
}
