"use client";

import { useRef } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAddressSubmit } from "@/hooks/address/useAddressSubmit";
import { useGooglePlaces } from "@/hooks/useGooglePlaces";
import { useAddressForm } from "@/hooks/address/useAddressForm";
import CreateAddressInputSection from "@/components/cart/modalAddress/createAddressInputSection";
import ActionsButtons from "@/components/cart/modalAddress/ActionsButtons";
import { Modal } from "@/components/ui/modal";
import { modalErrorVariants } from "@/components/ui/modal/variants";
import { Location } from "@/types/locations";
import { cn } from "@/lib/utils";

interface ModalAddressAdminProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onCreated: (location: Location) => void;
}

export function ModalAddressAdmin({
  isOpen,
  onClose,
  clientId,
  onCreated,
}: ModalAddressAdminProps) {
  const { user } = useAuth();
  const { formState, updateField, resetForm, errors, validateAndFocus, clearError } = useAddressForm();

  const addressRef = useRef<HTMLInputElement>(null);
  const addressNameRef = useRef<HTMLInputElement>(null);
  const floorRef = useRef<HTMLInputElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  const { submitAddress, isSubmitting, error } = useAddressSubmit(
    (location) => {
      onCreated(location);
      resetForm();
    },
    (err) => {
      console.error("Error al crear dirección:", err);
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
      const token = user ? await user.getIdToken() : null;
      await submitAddress(
        {
          name: formState.addressName,
          address: formState.address,
          coordinates: formState.coordinates,
          propertyType: formState.selectedType,
          floor: formState.floor || "",
          comment: formState.comment || "",
          clientId,
        },
        token
      );
    } catch {
      // handled by useAddressSubmit
    }
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="NUEVA DIRECCIÓN"
      size="xl"
      ariaLabel="nueva dirección para cliente"
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
}
