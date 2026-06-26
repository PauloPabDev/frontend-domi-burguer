import { useGetLocationByUser } from "@/hooks/locations/useGetLocationByUser";
import { Address } from "@/types/address";
import { Location } from "@/types/locations";
import { getIdToken } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { AddressService } from "@/services/addressService";
import { useCartStore } from "@/store/cartStore";

// Define aquí los campos que necesitas compartir
export interface FormValues {
    [key: string]: string | number | boolean | undefined | null;
}

interface CheckoutFormData {
    formData: FormValues;
    setFormData: (data: FormValues) => void;
    addressClient: Address | null;
    setAddressClient: (address: Address | null) => void;
    listLocationsClient: Location[];
    setListLocationsClient: (locations: Location[]) => void;
    location: Location | null;
    setLocation: (location: Location | null) => void;
    isLoadingDeliveryPrice: boolean;
    deliveryError: string | null;
    retryDeliveryPrice: () => void;
}

const CheckoutFormContext = createContext<CheckoutFormData | undefined>(undefined);

export const CheckoutFormProvider = ({ children }: { children: React.ReactNode }) => {

    const { user } = useAuth();
    const { setAddress, removeAddress } = useCartStore();
    const [token, setToken] = useState<string>("");

    // Obtener el token del usuario autenticado
    useEffect(() => {
        const fetchToken = async () => {
            if (user) {
                const idToken = await getIdToken(user);
                setToken(idToken);
            } else {
                setToken("");
            }
        };
        fetchToken();
    }, [user]);

    const { locations, fetchLocations } = useGetLocationByUser(token);

    const [formData, setFormData] = useState<FormValues>({});

    const [addressClient, setAddressClient] = useState<Address | null>(null);
    const [listLocationsClient, setListLocationsClient] = useState<Location[]>([]);


    //la location seleccionada actualmente, o la se creo recientemente
    const [location, setLocation] = useState<Location | null>(null);
    const [isLoadingDeliveryPrice, setIsLoadingDeliveryPrice] = useState(false);
    const [deliveryError, setDeliveryError] = useState<string | null>(null);

    const fetchDeliveryPrice = async (loc: Location) => {
        setIsLoadingDeliveryPrice(true);
        setDeliveryError(null);

        // Crear address parcial con los datos de location mientras carga
        const partialAddress: Address = {
            ...loc,
            distance: 0,
            fullAddress: loc.address,
            deliveryPrice: undefined,
        };
        setAddressClient(partialAddress);

        try {
            // Consultamos el precio del delivery
            const { delivery } = await AddressService.createDelivery(loc.id);
            const rta: Address = {
                ...loc,
                distance: delivery.distance,
                fullAddress: loc.address,
                deliveryPrice: delivery.price,
            };
            setAddressClient(rta);
        } catch (error) {
            console.error("Error al obtener datos de delivery:", error);
            setDeliveryError("No hay cocinas abiertas intenta mas tarde");
        }
        setIsLoadingDeliveryPrice(false);
    };

    const retryDeliveryPrice = () => {
        if (location) {
            fetchDeliveryPrice(location);
        }
    };

    useEffect(() => {
        if (location) {
            fetchDeliveryPrice(location);
        } else {
            setAddressClient(null);
            setDeliveryError(null);
            removeAddress();
        }
    }, [location]);

    // Sincronizar addressClient con el cartStore
    useEffect(() => {
        if (addressClient) {
            setAddress(addressClient);
        }
    }, [addressClient, setAddress]);

    useEffect(() => {
        setListLocationsClient(locations);

        // Seleccionar location por defecto solo si no hay una seleccionada
        if (locations.length > 0 && !location) {
            // Buscar la favorita
            const favoriteLocation = locations.find(loc => loc.favorite);

            if (favoriteLocation) {
                setLocation(favoriteLocation);
            } else {
                // Si no hay favorita, usar la última actualizada
                const sortedByDate = [...locations].sort(
                    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                );
                setLocation(sortedByDate[0]);
            }
        }
    }, [locations]);

    useEffect(() => {
        if (token) {
            fetchLocations();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);


    return (
        <CheckoutFormContext.Provider value={{
            formData, setFormData,
            addressClient, setAddressClient,
            listLocationsClient, setListLocationsClient,
            location, setLocation,
            isLoadingDeliveryPrice,
            deliveryError,
            retryDeliveryPrice
        }}>
            {children}
        </CheckoutFormContext.Provider>
    );
};

export const useCheckoutForm = () => {
    const context = useContext(CheckoutFormContext);
    if (!context) throw new Error("useCheckoutForm debe usarse dentro de CheckoutFormProvider");
    return context;
};
