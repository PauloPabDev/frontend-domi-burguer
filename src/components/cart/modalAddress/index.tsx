"use client";

import { useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAddressSubmit } from "@/hooks/address/useAddressSubmit";
import { useGooglePlaces } from "@/hooks/useGooglePlaces";
import { Address } from "@/types/address";
import { Loader2 } from "lucide-react";
import { getIdToken } from "firebase/auth";
import { useCheckoutForm } from "@/contexts/CheckoutFormContext";
import CreateAddressInputSection from "./createAddressInputSection";
import { useAddressForm } from "@/hooks/address/useAddressForm";
import ActionsButtons from "./ActionsButtons";
import { Modal } from "@/components/ui/modal";
import { modalErrorVariants } from "@/components/ui/modal/variants";
import { cn } from "@/lib/utils";

interface ModalAddressProps {
  isOpen: boolean;
  onClose: () => void;
  addressToEdit?: Address | null;
}

export const ModalAddress = ({ isOpen, onClose }: ModalAddressProps) => {
  const { user } = useAuth();

  const {
    setLocation,
    setListLocationsClient,
    listLocationsClient,
  } = useCheckoutForm();

  const { formState, updateField, resetForm, errors, validateAndFocus, clearError } = useAddressForm();

  const addressRef = useRef<HTMLInputElement>(null);
  const addressNameRef = useRef<HTMLInputElement>(null);
  const floorRef = useRef<HTMLInputElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  const { submitAddress, isSubmitting, error } = useAddressSubmit(
    (location) => {
      // Solo agregamos la location, el cálculo del delivery se hace en el contexto
      setListLocationsClient([...listLocationsClient, location]);
      setLocation(location);
      onClose();
      resetForm();
    },
    (error) => {
      console.error("Error al crear dirección:", error);
    }
  );

  const { isLoaded, onLoad, onPlaceChanged } = useGooglePlaces((place) => {
    if (place.geometry?.location && place.formatted_address) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      if (typeof lat === "number" && typeof lng === "number") {
        updateField("coordinates", { lat, lng });
        updateField("address", place.formatted_address);
      }
    }
  });

  const handleConfirm = async () => {
    if (!validateAndFocus({ addressRef, addressNameRef, floorRef, commentRef })) return;

    try {
      let token: string | null = null;
      if (user) {
        token = await getIdToken(user);
      }
      await submitAddress(
        createLocationData(),
        token
      );
    } catch (error) {
      console.error("Error al confirmar dirección:", error);
    }
  };

  const createLocationData = () => ({
    name: formState.addressName,
    address: formState.address,
    coordinates: formState.coordinates,
    propertyType: formState.selectedType,
    floor: formState.floor || "",
    comment: formState.comment || "",
  });

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="NUEVA DIRECCIÓN"
      size="xl"
      ariaLabel="seleccionar direccion"
      preventCloseSelectors={[".pac-container"]}
      footer={
        <ActionsButtons
          onClose={onClose}
          isSubmitting={isSubmitting}
          handleConfirm={handleConfirm}
        />
      }
      contentClassName="lg:w-[900px] lg:h-[680px]"
      bodyClassName="px-5 lg:px-8"
    >
      {error && (
        <div className={cn(modalErrorVariants({ type: "error" }), "mb-4")}>
          {error}
        </div>
      )}

      {isSubmitting && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-2xl">
          <Loader2 className="animate-spin text-primary-red" size={70} />
        </div>
      )}

      <CreateAddressInputSection
        isLoaded={isLoaded}
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        formState={formState}
        updateField={updateField}
        errors={errors}
        clearError={clearError}
        addressRef={addressRef}
        addressNameRef={addressNameRef}
        floorRef={floorRef}
        commentRef={commentRef}
      />
    </Modal>
  );
};
