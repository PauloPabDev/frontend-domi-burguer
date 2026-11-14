import { Heart } from "lucide-react";

interface LocationInfoProps {
    name: string;
    address: string;
    city?: string;
    state?: string;
    floor?: string;
    comment?: string;
    favorite?: boolean;
    /** Corazón relleno junto al nombre cuando la ubicación es favorita */
    showFavorite?: boolean;
    /** Si se pasa, el corazón es un botón que activa/desactiva la favorita */
    onToggleFavorite?: () => void;
    favoriteLoading?: boolean;
    /** Si es false oculta piso, ciudad y comentario */
    showDetails?: boolean;
}

// Texto de una dirección, igual en el perfil (Mis direcciones) y en el detalle del pedido
export function LocationInfo({
    name,
    address,
    city,
    state,
    floor,
    comment,
    favorite,
    showFavorite = false,
    onToggleFavorite,
    favoriteLoading = false,
    showDetails = true,
}: LocationInfoProps) {
    return (
        <div className="flex-1 min-w-0">
            <h3 className="flex items-center gap-2 font-semibold text-neutral-800 text-base">
                {name}
                {onToggleFavorite ? (
                    <button
                        type="button"
                        onClick={onToggleFavorite}
                        disabled={favoriteLoading}
                        aria-pressed={!!favorite}
                        aria-label={favorite ? "Quitar como dirección principal" : "Marcar como dirección principal"}
                        className={`p-1 -m-1 transition-colors disabled:opacity-50 ${favorite ? "text-red-500" : "text-neutral-400 hover:text-red-500"}`}
                    >
                        <Heart className={`w-5 h-5 ${favorite ? "fill-current" : ""}`} />
                    </button>
                ) : (
                    showFavorite && favorite && (
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" aria-label="Dirección principal" />
                    )
                )}
            </h3>
            <p className="text-sm text-neutral-600 mt-1">{address}</p>
            {showDetails && (
                <>
                    {floor && <p className="text-sm text-neutral-600">Piso/Apto: {floor}</p>}
                    <p className="text-sm text-neutral-500">
                        {city}{state ? `, ${state}` : ""}
                    </p>
                    {comment && <p className="text-sm text-neutral-400 italic mt-1">{comment}</p>}
                </>
            )}
        </div>
    );
}
