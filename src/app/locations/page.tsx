"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Location } from "@/types/locations";
import { Loader2, Plus } from "lucide-react";
import { LocationService } from "@/services/locationService";
import { getIdToken } from "firebase/auth";
import { LocationCard } from "./LocationCard";
import { CheckoutFormProvider } from "@/contexts/CheckoutFormContext";
import { Address } from "@/types/address";

// Lazy load modal pesado
const ModalAddress = dynamic(
    () => import("@/components/cart/modalAddress").then(mod => mod.ModalAddress),
    { ssr: false }
);

export default function LocationsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) return;
            setIsLoadingAddresses(true);
            setError(null);
            try {
                const token = await getIdToken(user);
                const userAddresses = await LocationService.getUserLocations(token);
                setLocations(userAddresses.body);
            } catch (err) {
                console.error("Error cargando direcciones del usuario", err);
                setError("No se pudieron cargar tus direcciones");
            } finally {
                setIsLoadingAddresses(false);
            }
        };

        if (user) {
            fetchAddresses();
        }
    }, [user]);

    const handleOpenCreate = () => {
        setAddressToEdit(null);
        setIsModalOpen(true);
    };

    const mapLocationToAddressLike = (location: Location): Address => {
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

    const handleOpenEdit = (location: Location) => {
        setAddressToEdit(mapLocationToAddressLike(location));
        setIsModalOpen(true);
    };

    const handleCloseModal = async () => {
        setIsModalOpen(false);
        setAddressToEdit(null);
        if (user) {
            try {
                const token = await getIdToken(user);
                const userAddresses = await LocationService.getUserLocations(token);
                setLocations(userAddresses.body);
            } catch (err) {
                console.error("Error recargando direcciones", err);
            }
        }
    };

    const handleRefresh = async () => {
        if (!user) return;
        try {
            const token = await getIdToken(user);
            const userAddresses = await LocationService.getUserLocations(token);
            setLocations(userAddresses.body);
        } catch (err) {
            console.error("Error recargando direcciones", err);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-primary-red" size={70} />
            </div>
        );
    }

    return (
        <CheckoutFormProvider>
            <div className="mt-8 lg:mt-[130px] min-h-screen bg-white py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-xl font-bold text-neutral-800 mb-6 uppercase">
                        Mis Direcciones
                    </h1>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {isLoadingAddresses ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-primary-red" size={40} />
                        </div>
                    ) : locations.length === 0 ? (
                        <div className="py-10 text-center text-neutral-500">
                            <p className="mb-4">Aún no tienes direcciones guardadas.</p>
                        </div>
                    ) : (
                        <div className="mb-6">
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
                        className="w-full py-4 border-2 border-dashed border-[#e73533] rounded-lg flex items-center justify-center gap-2 text-neutral-800 font-medium hover:bg-red-50 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        AGREGAR DIRECCIÓN
                    </button>
                </div>

                <ModalAddress
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    addressToEdit={addressToEdit}
                />
            </div>
        </CheckoutFormProvider>
    );
}
