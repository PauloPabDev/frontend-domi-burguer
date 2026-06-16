"use client";

import { useState } from "react";
import { Location } from "@/types/locations";
import { ExternalLink, Heart, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getIdToken } from "firebase/auth";
import { LocationService } from "@/services/locationService";
import { track } from "@/utils/analytics";
import { ConfirmModal } from "@/components/ui/modal/presets/ConfirmModal";

interface LocationCardProps {
    location: Location;
    onEdit: (location: Location) => void;
    onRefresh: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
    location,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onEdit,
    onRefresh,
}) => {
    const { user } = useAuth();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSettingFavorite, setIsSettingFavorite] = useState(false);

    const handleSetFavorite = async () => {
        if (!user || isSettingFavorite) return;
        setIsSettingFavorite(true);
        try {
            const token = await getIdToken(user);
            await LocationService.setFavoriteLocation(token, location.id);
            onRefresh();
        } catch (error) {
            console.error("Error setting favorite location:", error);
        } finally {
            setIsSettingFavorite(false);
        }
    };

    const handleDelete = async () => {
        if (!user || isDeleting) return;
        setIsDeleting(true);
        try {
            const token = await getIdToken(user);
            await LocationService.deleteLocation(token, location.id);
            track('address_deleted', { address_name: location.name });
            onRefresh();
        } catch (error) {
            console.error("Error deleting location:", error);
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <>
        <ConfirmModal
            open={showDeleteModal}
            onOpenChange={setShowDeleteModal}
            title="Eliminar dirección"
            message={`¿Estás seguro de que deseas eliminar "${location.name}"?`}
            onConfirm={handleDelete}
            confirmText="ELIMINAR"
            cancelText="CANCELAR"
            destructive
            loading={isDeleting}
        />
        <div className="flex items-start justify-between py-4 gap-4 border-b border-gray-200 last:border-b-0">
            <div className="flex-1">
                <h3 className="font-semibold text-neutral-800 text-base">
                    {location.name}
                </h3>
                <p className="text-sm text-neutral-600 mt-1">
                    {location.address}
                </p>
                {location.floor && (
                    <p className="text-sm text-neutral-600">
                        Piso/Apto: {location.floor}
                    </p>
                )}
                <p className="text-sm text-neutral-500">
                    {location.city}{location.state ? `, ${location.state}` : ''}
                </p>
                {location.comment && (
                    <p className="text-sm text-neutral-400 italic mt-1">
                        {location.comment}
                    </p>
                )}
                {location.coordinates?.lat && location.coordinates?.lng && (
                    <a
                        href={`https://www.google.com/maps?q=${location.coordinates.lat},${location.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700 mt-2 transition-colors"
                    >
                        Ver en Google Maps
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={handleSetFavorite}
                    disabled={isSettingFavorite}
                    className={`p-2 transition-colors disabled:opacity-50 ${
                        location.favorite
                            ? "text-red-500"
                            : "text-neutral-400 hover:text-red-500"
                    }`}
                    aria-label={location.favorite ? "Dirección principal" : "Marcar como principal"}
                >
                    <Heart className={`w-5 h-5 ${location.favorite ? "fill-current" : ""}`} />
                </button>
                <button
                    disabled
                    className="p-2 text-neutral-300 cursor-not-allowed"
                    aria-label="Editar dirección"
                >
                    <Pencil className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    aria-label="Eliminar dirección"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
        </>
    );
};
