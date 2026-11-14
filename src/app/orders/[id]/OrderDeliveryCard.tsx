"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { getIdToken } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { LocationService } from "@/services/locationService";
import { DeliveryAddress } from "@/types/orders";
import { Location } from "@/types/locations";
import { Card, CardContent } from "@/components/ui/card";
import { formatCOP } from "@/components/ui/OrderItemsList";
import { LocationInfo } from "@/components/locations/LocationInfo";
import MapComponent from "@/components/map/map";

interface OrderDeliveryCardProps {
    address: DeliveryAddress;
    /** Ubicación guardada (si el pedido la trae): aporta favorita y enlace al perfil */
    location?: Location;
    /** La ubicación pertenece al usuario que ve el pedido */
    isOwner?: boolean;
}

export function OrderDeliveryCard({ address, location, isOwner = false }: OrderDeliveryCardProps) {
    const { user } = useAuth();
    const [expanded, setExpanded] = useState(false);
    const [favorite, setFavorite] = useState(location?.favorite ?? false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const { lat, lng } = address.coordinates ?? {};
    const hasCoords = typeof lat === "number" && typeof lng === "number";

    // Se pide el cambio y se relee la ubicación: el estado mostrado es el real del servidor
    const handleToggleFavorite = async () => {
        if (!user || !location?.id || favoriteLoading) return;
        setFavoriteLoading(true);
        try {
            const token = await getIdToken(user);
            await LocationService.setFavoriteLocation(token, location.id);
            const { body } = await LocationService.getByIdAuthenticated(location.id, token);
            setFavorite(body.favorite);
        } catch (error) {
            console.error("Error cambiando la dirección favorita:", error);
        } finally {
            setFavoriteLoading(false);
        }
    };

    return (
        <Card className="p-4 w-full bg-accent-yellow-10 rounded-[12px] shadow-none border-0">
            <CardContent className="p-0 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                    <LocationInfo
                        name={location?.name || address.name || "Dirección de entrega"}
                        address={address.address}
                        city={address.city}
                        state={location?.state}
                        floor={address.floor}
                        comment={address.comment}
                        favorite={favorite}
                        showFavorite
                        onToggleFavorite={isOwner && location?.id ? handleToggleFavorite : undefined}
                        favoriteLoading={favoriteLoading}
                        showDetails={expanded}
                    />
                    <h4 className="shrink-0">{formatCOP(address.deliveryPrice)}</h4>
                </div>

                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    aria-expanded={expanded}
                    className="flex items-center gap-1 w-fit text-sm font-medium text-neutral-black-60 hover:text-neutral-black-80 transition-colors"
                >
                    {expanded ? "Ver menos" : "Ver más detalles"}
                    <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>

                {hasCoords && (
                    <div className="relative aspect-video w-full rounded-[12px] overflow-hidden">
                        <MapComponent
                            coordinates={{ lat, lng }}
                            className="absolute inset-0"
                            minHeight="0"
                            showZoomControl={false}
                            markerAnchor={{ x: 35, y: 78 }}
                            gestureHandling="cooperative"
                        />
                    </div>
                )}

                <div className="flex items-center">
                    {hasCoords && (
                        <a
                            href={`https://www.google.com/maps?q=${lat},${lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700 transition-colors"
                        >
                            Abrir en Google Maps
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
