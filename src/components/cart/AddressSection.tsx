import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddressCard from "../AddressCard";
import { useCheckoutForm } from "@/contexts/CheckoutFormContext";
import { ModalLocationsList } from "./ModalLocationsList";
import { useAddressManagement } from "@/hooks/cart/useAddressManagement";
import { useAuth } from "@/contexts/AuthContext";

// Lazy load modal pesado
const ModalAddress = dynamic(
    () => import("./modalAddress").then(mod => mod.ModalAddress),
    { ssr: false }
);



export function AddressSection() {

    //si no es usuario autenticado , miramos si tiene direccion en el local storage
    const {
        addressClient,
        listLocationsClient,
        location,
        isLoadingDeliveryPrice,
        deliveryError,
        setLocation,
        retryDeliveryPrice
    } = useCheckoutForm();
    const {
        isModalOpen,
        addressToEdit,
        handleCloseModal,
        handleOpenModal,
    } = useAddressManagement();

    const { user } = useAuth();
    const [isListModalOpen, setIsListModalOpen] = useState(false);

    const hasMultipleLocations = listLocationsClient && listLocationsClient.length > 0;
    const hasSelectedLocation = addressClient || (location && isLoadingDeliveryPrice);

    // Solo deselecciona la location de esta sección (no la elimina del backend)
    const handleRemoveSelection = () => {
        setLocation(null);
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between">
                <p className="body-font font-bold">¡Necesitamos tu dirección!</p>
                {user && (
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="inline-flex px-3 py-2 rounded-[20px] border-[1.5px] border-solid border-[#313131] items-center justify-center gap-2 h-auto"
                            disabled={!hasMultipleLocations}
                            onClick={() => setIsListModalOpen(true)}
                        >
                            Ver todas
                        </Button>
                    </div>
                )}
            </div>

            {/* Mostrar botones cuando NO hay location seleccionada */}
            {!hasSelectedLocation && (
                <div className="flex flex-col gap-3">
                    <Button
                        type="button"
                        variant="default"
                        className=""
                        onClick={handleOpenModal}
                    >
                        <Plus />
                        AGREGAR DIRECCIÓN
                    </Button>

                    {user && hasMultipleLocations && (
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-[30px] flex items-center gap-2 xl:w-[260px] xl:h-[48px] h-[40px] w-full label-font border-[1.5px] border-solid border-[#313131]"
                            onClick={() => setIsListModalOpen(true)}
                        >
                            <List className="w-4 h-4" />
                            SELECCIONAR DIRECCIÓN
                        </Button>
                    )}
                </div>
            )}

            {/* Mostrar card cuando HAY location seleccionada */}
            {hasSelectedLocation && (
                <div className="flex flex-col gap-3">
                    <AddressCard
                        address={addressClient || {
                            ...location!,
                            distance: 0,
                            fullAddress: location!.address,
                            deliveryPrice: undefined,
                        }}
                        isFavorite={location?.favorite}
                        isLoadingPrice={isLoadingDeliveryPrice}
                        deliveryError={deliveryError}
                        onDelete={handleRemoveSelection}
                        onRetry={retryDeliveryPrice}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-[30px] flex items-center gap-2 h-[40px] w-full label-font border-[1.5px] border-solid border-[#313131]"
                        onClick={handleOpenModal}
                    >
                        <Plus className="w-4 h-4" />
                        CAMBIAR DIRECCIÓN
                    </Button>
                </div>
            )}

            <ModalAddress
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                addressToEdit={addressToEdit}
            />

            <ModalLocationsList
                isOpen={isListModalOpen}
                onClose={() => setIsListModalOpen(false)}
                locations={listLocationsClient || []}
            />

        </div>
    );
}
