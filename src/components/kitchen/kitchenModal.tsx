"use client";

import { Button } from "@/components/ui/button";
import { InstagramIcon, WhatsAppIcon, TiktokIcon } from "../ui/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Modal } from "@/components/ui/modal";
import { Loader2, Mail } from "lucide-react";

import { useKitchenModal } from "@/hooks/kitchen/useKitchenModal";
import { KitchenHoursCard } from "./KitchenHoursCard";
import { DeliveryPriceCard } from "./DeliveryPriceCard";
import { UserLocationSelector } from "./UserLocationSelector";
import { MultiMarkerMap, MapMarker } from "@/components/map/MultiMarkerMap";

interface KitchenModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleBackButton?: boolean;
}

export const KitchenModal = ({ isOpen, onClose, handleBackButton = true }: KitchenModalProps) => {
  const {
    kitchens,
    selectedKitchen,
    userLocations,
    selectedLocation,
    isLoadingKitchens,
    isLoadingLocations,
    isLoadingDelivery,
    isAuthenticated,
    error,
    selectKitchen,
    selectLocation,
    formattedDeliveryPrice,
    parsedHours,
  } = useKitchenModal({ isOpen });
  const mapMarkers: MapMarker[] = kitchens
    .filter(k => k.location?.coordinates?.lat && k.location?.coordinates?.lng)
    .map(k => ({
      id: k.id,
      position: {
        lat: k.location!.coordinates.lat,
        lng: k.location!.coordinates.lng,
      },
      label: k.name,
    }));

  const selectedCoordinates = selectedKitchen?.location?.coordinates;

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="INFORMACIÓN DE LA COCINA"
      size="xl"
      footer={false}
      ariaLabel="informacion de cocinas"
      bodyClassName="px-5 pb-8 lg:px-8"
      handleBackButton={handleBackButton}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse lg:flex-row gap-2 lg:gap-6 h-full">
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-3 lg:gap-4">
            {/* Selector de cocina */}
            <Select
              value={selectedKitchen?.id}
              onValueChange={selectKitchen}
              disabled={isLoadingKitchens}
            >
              <SelectTrigger className="text-neutral-black-50! body-font">
                <SelectValue
                  placeholder={
                    isLoadingKitchens
                      ? "Cargando cocinas..."
                      : "Seleccionar cocina"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {kitchens.map((kitchen) => (
                  <SelectItem key={kitchen.id} value={kitchen.id}>
                    {kitchen.name}
                  </SelectItem>
                ))}
                {!isLoadingKitchens && kitchens.length === 0 && (
                  <SelectItem value="no-kitchens" disabled>
                    No hay cocinas disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            {/* Indicador de estado Abierto/Cerrado */}
            <div className="flex items-center justify-between px-4 py-2 rounded-full border border-gray-200">
              {parsedHours?.isCurrentlyOpen ? (
                <>
                  <span className="text-green-600 font-medium body-font">Abierto</span>
                  {/* {countdownText && (
                    <span className="text-neutral-black-60 body-font">
                      Cerramos en <span className="font-bold">{countdownText}</span>
                    </span>
                  )} */}
                </>
              ) : (
                <span className="text-red-500 font-medium body-font">Cerrado</span>
              )}
            </div>

            {/* Tarjeta de horarios */}
            <KitchenHoursCard
              parsedHours={parsedHours}
              isLoading={isLoadingKitchens}
            />

            {/* Tarjeta de precio de domicilio */}
            <DeliveryPriceCard
              price={formattedDeliveryPrice}
              isLoading={isLoadingDelivery}
            />

            {/* Selector de ubicacion del usuario (solo si esta logueado) */}
            {isAuthenticated && (
              <UserLocationSelector
                locations={userLocations}
                selectedLocationId={selectedLocation?.id}
                onSelect={selectLocation}
                isLoading={isLoadingLocations}
              />
            )}

            {/* Botones de redes sociales */}
            <div className="flex gap-4 w-full">
              <Button
                variant="ghost"
                className="flex w-12 h-12 px-3 py-2 relative items-center justify-center gap-2 rounded-[30px]"
                aria-label="TikTok"
              >
                <TiktokIcon />
              </Button>
              <Button
                variant="ghost"
                className="flex w-12 h-12 px-3 py-2 relative items-center justify-center gap-2 rounded-[30px]"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </Button>
              <Button
                variant="ghost"
                className="flex w-12 h-12 px-3 py-2 relative items-center justify-center gap-2 rounded-[30px]"
                aria-label="Correo"
              >
                <Mail className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                className="inline-flex h-12 px-5 py-2 relative items-center justify-center gap-2 rounded-[30px] text-black"
              >
                <span className="relative w-fit whitespace-nowrap">CONTÁCTANOS</span>
                <WhatsAppIcon />
              </Button>
            </div>
          </div>
        </div>

        {/* Mapa con todas las cocinas */}
        <div className="flex-1 min-h-[200px] w-full bg-accent-yellow-40 rounded-xl overflow-hidden">
          {isLoadingKitchens ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <Loader2 className="w-8 h-8 animate-spin text-neutral-black-50" />
            </div>
          ) : (
            <MultiMarkerMap
              markers={mapMarkers}
              selectedMarkerId={selectedKitchen?.id}
              center={
                selectedCoordinates?.lat && selectedCoordinates?.lng
                  ? { lat: selectedCoordinates.lat, lng: selectedCoordinates.lng }
                  : undefined
              }
              onMarkerClick={selectKitchen}
              minHeight="200px"
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
