"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Loader2, Plus, CheckCircle } from "lucide-react";
import { Location } from "@/types/locations";
import { Address } from "@/types/address";
import { LocationService } from "@/services/locationService";
import { LocationCard } from "@/app/locations/LocationCard";
import { useAuth } from "@/contexts/AuthContext";
import { getIdToken } from "firebase/auth";
import { track } from "@/utils/analytics";

const ModalAddress = dynamic(
    () => import("@/components/cart/modalAddress").then((mod) => mod.ModalAddress),
    { ssr: false }
);

export function AddressesSection() {
    const { user } = useAuth();
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);

    const fetchAddresses = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const token = await getIdToken(user);
            const userAddresses = await LocationService.getUserLocations(token);
            setLocations(userAddresses.body);
        } catch (err) {
            console.error("Error cargando direcciones del usuario", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const mapLocationToAddress = (location: Location): Address => {
        return {
            id: location.id,
            name: location.name,
            address: location.address,
            fullAddress: location.address,
            city: location.city,
            country: location.country,
            floor: location.floor,
            comment: location.comment,
            propertyType: location.propertyType || "",
            coordinates: {
                lat: location.coordinates.lat ?? 0,
                lng: location.coordinates.lng ?? 0,
            },
            distance: 0,
            deliveryPrice: 0,
        };
    };

    const handleOpenCreate = () => {
        track('address_modal_opened', { trigger: 'profile_new_address' });
        setAddressToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (location: Location) => {
        setAddressToEdit(mapLocationToAddress(location));
        setIsModalOpen(true);
    };

    const handleCloseModal = async () => {
        setIsModalOpen(false);
        setAddressToEdit(null);
        await fetchAddresses();
    };

    const handleRefresh = async () => {
        await fetchAddresses();
    };

    return (
        <>
            <div className="mb-8">
                <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wide mb-4">
                    MIS DIRECCIONES
                </h2>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="animate-spin text-primary-red" size={32} />
                    </div>
                ) : locations.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6 text-center mb-4">
                        <p className="text-neutral-500">
                            Aún no tienes direcciones guardadas
                        </p>
                    </div>
                ) : (
                    <div className="mb-4">
                        {locations.map((location) => (
                            <LocationCard
                                key={location.id}
                                location={location}
                                onEdit={handleOpenEdit}
                                onRefresh={handleRefresh}
                            />
                        ))}
                    </div>
                )}

                <button
                    onClick={handleOpenCreate}
                    className="w-full py-4 border-2 border-dashed border-neutral-300 rounded-xl flex items-center justify-center gap-2 text-neutral-700 font-medium hover:border-primary-red hover:text-primary-red transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    AGREGAR DIRECCIÓN
                </button>

                <div className="flex items-center gap-3 mt-6 text-neutral-400 text-sm">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Guardaremos tu información de forma segura</span>
                </div>
            </div>

            <ModalAddress
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                addressToEdit={addressToEdit}
            />
        </>
    );
}
