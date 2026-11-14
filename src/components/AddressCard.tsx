import { Address } from "@/types/address";
import { Card, CardContent } from "./ui/card";
import { AlarmClock, Bike, CheckCircle2, Clock, Heart, Loader2, RefreshCw, Trash2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { KitchenStatusLabel, KitchenStatusTone } from "@/utils/kitchenStatusLabel";

interface addressCardProps {
    address: Address;
    isFavorite?: boolean;
    isLoadingPrice?: boolean;
    deliveryError?: string | null;
    /** Estado de la cocina: abierta, por cerrar o cuándo abre */
    statusLabel?: KitchenStatusLabel | null;
    onDelete?: () => void;
    onRetry?: () => void;
    isDeleting?: boolean;
}

// Caja del estado: color + ícono + borde, para que no dependa solo del color
const STATUS_BOX: Record<KitchenStatusTone, { box: string; icon: LucideIcon; iconClass: string }> = {
    open: { box: "bg-green-50 border-green-200 text-green-800", icon: CheckCircle2, iconClass: "text-green-600" },
    warning: { box: "bg-amber-50 border-amber-300 text-amber-800", icon: AlarmClock, iconClass: "text-amber-600" },
    closed: { box: "bg-red-50 border-red-200 text-red-700", icon: Clock, iconClass: "text-primary-red" },
    unknown: { box: "bg-white border-neutral-black-10 text-neutral-black-60", icon: Clock, iconClass: "text-neutral-black-50" },
};

const AddressCard = ({
    address,
    isFavorite = false,
    isLoadingPrice = false,
    deliveryError = null,
    statusLabel = null,
    onDelete,
    onRetry,
    isDeleting = false,
}: addressCardProps) => {

    // Con las cocinas cerradas el precio es el de la cocina que abre primero
    const isEstimate = statusLabel?.tone === "closed";

    const renderPrice = () => {
        if (isLoadingPrice) {
            return (
                <div className="flex items-center gap-2 text-neutral-black-50" aria-busy="true">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Calculando…</span>
                </div>
            );
        }

        if (address.deliveryPrice === undefined) return null;

        if (address.deliveryPrice === 0) {
            return <span className="text-2xl font-bold text-green-700">Gratis</span>;
        }

        return (
            <span className="text-2xl font-bold tabular-nums leading-none">
                ${address.deliveryPrice.toLocaleString("es-CO")}
            </span>
        );
    };

    const renderStatus = () => {
        if (!statusLabel || isLoadingPrice) return null;
        const { box, icon: Icon, iconClass } = STATUS_BOX[statusLabel.tone];

        return (
            <div role="status" className={cn("flex items-start gap-3 rounded-xl border px-3 py-2.5", box)}>
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)} aria-hidden="true" />
                <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="body-font font-bold">{statusLabel.headline}</span>
                    {statusLabel.detail && (
                        <span className="text-sm leading-snug">
                            {statusLabel.detail}
                            {statusLabel.countdown && (
                                <>
                                    {" · "}
                                    <strong className="whitespace-nowrap">{statusLabel.countdown}</strong>
                                </>
                            )}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Card className="w-full bg-accent-yellow-10 rounded-[12px] shadow-none border-0">
            <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <h5 className="body-font font-bold">{address.name || "Dirección sin nombre"}</h5>
                            {isFavorite && (
                                <Heart className="h-4 w-4 shrink-0 fill-red-500 text-red-500" aria-label="Favorita" />
                            )}
                        </div>
                        <div className="body-font flex flex-col gap-0.5 text-neutral-black-60">
                            <span>{address.city}, {address.country}</span>
                            <span>{address.address || "Dirección no especificada"}</span>
                            {address.floor && <span>{address.floor}</span>}
                        </div>
                    </div>
                    {onDelete && (
                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={isDeleting}
                            className="-mr-2 -mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            aria-label="Quitar dirección"
                        >
                            {isDeleting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Trash2 className="h-5 w-5" />
                            )}
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-3 border-t border-accent-yellow-40 pt-4">
                    {deliveryError ? (
                        <div role="alert" className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-red-700">
                            <span className="text-sm leading-snug">{deliveryError}</span>
                            {onRetry && (
                                <button
                                    type="button"
                                    onClick={onRetry}
                                    className="flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-bold transition-colors hover:bg-red-100"
                                >
                                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                                    Reintentar
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {(isLoadingPrice || address.deliveryPrice !== undefined) && (
                                <div className="flex items-center justify-between gap-3">
                                    <span className="body-font flex items-center gap-2 text-neutral-black-60">
                                        <Bike className="h-5 w-5" aria-hidden="true" />
                                        {isEstimate ? "Domicilio estimado" : "Domicilio"}
                                    </span>
                                    {renderPrice()}
                                </div>
                            )}
                            {renderStatus()}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default AddressCard;
