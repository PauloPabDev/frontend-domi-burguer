"use client";

import { useState } from "react";
import { BellRing, CheckCircle2, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { track } from "@/utils/analytics";

const DISMISSED_KEY = "notifications-prompt-dismissed";

function wasDismissed(): boolean {
    try {
        return localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
        return false;
    }
}

function rememberDismissed() {
    try {
        localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
        // sin almacenamiento disponible: el aviso volverá a aparecer, no pasa nada
    }
}

/**
 * Invita al cliente a activar las notificaciones para enterarse cuando su pedido esté listo.
 * Se oculta sola si ya las activó, si las bloqueó en el navegador o si dijo "Ahora no".
 */
export function EnableNotificationsPrompt() {
    const { availability, permission, deviceEnabled, preferences, busy, error, enableDevice, setCategory } =
        usePushNotifications();
    const [dismissed, setDismissed] = useState(wasDismissed);
    const [justEnabled, setJustEnabled] = useState(false);

    const handleEnable = async () => {
        const enabled = await enableDevice();
        track("notifications_prompt_accepted", { granted: enabled });
        if (!enabled) return;
        // si antes había apagado los avisos de pedidos, activarlos aquí es justo lo que pide
        if (!preferences.functional) await setCategory("functional", true);
        setJustEnabled(true);
    };

    const handleDismiss = () => {
        track("notifications_prompt_dismissed");
        rememberDismissed();
        setDismissed(true);
    };

    if (justEnabled) {
        return (
            <div className="flex items-center gap-3 w-full max-w-[420px] rounded-[16px] bg-green-50 border border-green-300 px-4 py-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                <p className="body-font text-green-800">
                    <span className="font-bold">¡Listo!</span> Te avisaremos en este celular cuando tu pedido esté listo 🍔
                </p>
            </div>
        );
    }

    const canEnable = availability === "ready" && !deviceEnabled && permission !== "denied";
    const needsInstall = availability === "needs-install";
    if (dismissed || (!canEnable && !needsInstall)) return null;

    return (
        <div className="relative flex flex-col gap-3 w-full max-w-[420px] rounded-[16px] bg-white border border-accent-yellow-60 px-4 py-4 shadow-sm">
            <button
                type="button"
                onClick={handleDismiss}
                aria-label="Cerrar"
                className="absolute top-2 right-2 p-1 text-neutral-black-50 hover:text-neutral-black-80 cursor-pointer"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 pr-5">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-yellow-40 shrink-0">
                    <BellRing className="w-5 h-5 text-neutral-black-80" />
                </div>
                <div className="flex flex-col gap-1">
                    <p className="font-bold text-neutral-black-80">¿Te avisamos cuando esté listo?</p>
                    <p className="body-font text-neutral-black-50">
                        {needsInstall ? (
                            <>
                                Instala la app para recibir avisos de tu pedido: toca{" "}
                                <Share className="inline w-4 h-4 -mt-1" /> Compartir y luego «Añadir a pantalla de
                                inicio».
                            </>
                        ) : (
                            "Activa las notificaciones y te avisamos en tu celular cuando tu pedido se esté preparando, salga hacia tu casa y llegue. Sin spam, solo lo importante."
                        )}
                    </p>
                </div>
            </div>

            {canEnable && (
                <div className="flex items-center gap-2">
                    <Button variant="primary" size="md" loading={busy} onClick={handleEnable}>
                        Sí, avísame
                    </Button>
                    <Button variant="ghost" size="md" onClick={handleDismiss}>
                        Ahora no
                    </Button>
                </div>
            )}
            {error && <p className="text-xs text-primary-red">{error}</p>}
        </div>
    );
}
