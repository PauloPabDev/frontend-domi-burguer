"use client";

import { Location } from "@/types/locations";
import { useCheckoutForm } from "@/contexts/CheckoutFormContext";
import { Heart } from "lucide-react";
import { ListModal } from "@/components/ui/modal";

interface ModalLocationsListProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
}

export function ModalLocationsList({
  isOpen,
  onClose,
  locations,
}: ModalLocationsListProps) {
  const { setLocation, location: selectedLocation } = useCheckoutForm();

  const handleSelectAddress = (location: Location) => {
    setLocation(location);
    onClose();
  };

  return (
    <ListModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Mis direcciones"
      description="Selecciona una dirección de entrega"
      size="lg"
      items={locations}
      keyExtractor={(loc) => loc.id}
      emptyMessage="No tienes direcciones guardadas"
      renderItem={(loc) => {
        const isSelected = selectedLocation?.id === loc.id;

        return (
          <button
            key={loc.id}
            type="button"
            onClick={() => handleSelectAddress(loc)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
              isSelected
                ? "border-accent-yellow-80 bg-accent-yellow-10"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-neutral-800 text-base">
                    {loc.name}
                  </h3>
                  {loc.favorite && (
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-neutral-600 mt-1">
                  {loc.address}
                </p>
                {loc.floor && (
                  <p className="text-sm text-neutral-600">
                    Piso/Apto: {loc.floor}
                  </p>
                )}
                <p className="text-sm text-neutral-500">
                  {loc.city}{loc.state ? `, ${loc.state}` : ""}
                </p>
                {loc.comment && (
                  <p className="text-sm text-neutral-400 italic mt-1">
                    {loc.comment}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      }}
    />
  );
}
