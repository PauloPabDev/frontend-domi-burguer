"use client";

import { useEffect } from "react";
import { Bell, BellOff, Megaphone, Package, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { NotificationCategory } from "@/types/notifications";

const CATEGORIES: {
    key: NotificationCategory;
    label: string;
    description: string;
    Icon: React.FC<{ className?: string }>;
}[] = [
    {
        key: "functional",
        label: "Pedidos",
        description: "Estado de tu pedido y, si trabajas con nosotros, los pedidos que te asignan",
        Icon: Package,
    },
    {
        key: "promotional",
        label: "Promociones",
        description: "Ofertas, códigos y novedades de Domi Burguer",
        Icon: Megaphone,
    },
];

const SECTION_ID = "notificaciones";

const UNAVAILABLE_MESSAGES = {
    unsupported: "Este navegador no permite notificaciones push.",
    "needs-install":
        "En iPhone las notificaciones solo funcionan con la app instalada: toca Compartir y luego «Añadir a pantalla de inicio».",
    unavailable: "Las notificaciones no están disponibles en este momento.",
} as const;

export function NotificationsSection() {
    const {
        availability,
        permission,
        deviceEnabled,
        preferences,
        busy,
        error,
        enableDevice,
        disableDevice,
        setCategory,
    } = usePushNotifications();

    // El botón "No recibir promociones" de la notificación abre /profile#notificaciones, pero la sección
    // aparece después de cargar: el navegador ya intentó saltar al ancla y no la encontró
    useEffect(() => {
        if (availability !== "checking" && window.location.hash === `#${SECTION_ID}`) {
            document.getElementById(SECTION_ID)?.scrollIntoView({ behavior: "smooth" });
        }
    }, [availability]);

    if (availability === "checking") return null;

    return (
        <div id={SECTION_ID} className="mb-8 scroll-mt-24">
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wide mb-4">
                NOTIFICACIONES
            </h2>

            {availability !== "ready" ? (
                <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl">
                    <BellOff className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-neutral-500">{UNAVAILABLE_MESSAGES[availability]}</p>
                </div>
            ) : (
                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
                    <div className="flex items-center justify-between gap-4 p-4">
                        <div className="flex items-center gap-4">
                            <Smartphone className="w-5 h-5 text-neutral-500 shrink-0" />
                            <div>
                                <p className="font-medium text-neutral-800">Notificaciones en este dispositivo</p>
                                <p className="text-xs text-neutral-500">
                                    {permission === "denied"
                                        ? "Bloqueadas en el navegador"
                                        : deviceEnabled
                                          ? "Activadas"
                                          : "Desactivadas"}
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={deviceEnabled}
                            disabled={busy || permission === "denied"}
                            onCheckedChange={(checked) => (checked ? enableDevice() : disableDevice())}
                            aria-label="Notificaciones en este dispositivo"
                        />
                    </div>

                    {CATEGORIES.map(({ key, label, description, Icon }) => (
                        <div key={key} className="flex items-center justify-between gap-4 p-4">
                            <div className="flex items-center gap-4">
                                <Icon className="w-5 h-5 text-neutral-500 shrink-0" />
                                <div>
                                    <p className="font-medium text-neutral-800">{label}</p>
                                    <p className="text-xs text-neutral-500">{description}</p>
                                </div>
                            </div>
                            <Switch
                                checked={preferences[key]}
                                onCheckedChange={(checked) => setCategory(key, checked)}
                                aria-label={label}
                            />
                        </div>
                    ))}
                </div>
            )}

            {availability === "ready" && !deviceEnabled && permission !== "denied" && (
                <p className="flex items-center gap-2 text-xs text-neutral-500 mt-3">
                    <Bell className="w-4 h-4 shrink-0" />
                    Activa las notificaciones en este dispositivo para recibirlas.
                </p>
            )}
            {permission === "denied" && availability === "ready" && (
                <p className="text-xs text-primary-red mt-3">
                    Bloqueaste las notificaciones. Actívalas desde los ajustes del navegador para este sitio.
                </p>
            )}
            {error && <p className="text-xs text-primary-red mt-3">{error}</p>}
        </div>
    );
}
