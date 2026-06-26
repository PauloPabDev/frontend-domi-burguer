"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Location } from "@/types/locations";
import { MapPin, Star } from "lucide-react";

interface UserLocationSelectorProps {
  locations: Location[];
  selectedLocationId?: string;
  onSelect: (locationId: string) => void;
  isLoading?: boolean;
}

export const UserLocationSelector = ({
  locations,
  selectedLocationId,
  onSelect,
  isLoading,
}: UserLocationSelectorProps) => {
  if (locations.length === 0 && !isLoading) {
    return (
      <div className="p-4 bg-neutral-black-10 rounded-xl text-center">
        <p className="body-font text-neutral-black-60">
          No tienes ubicaciones guardadas
        </p>
        <p className="text-sm text-neutral-black-40 mt-1">
          Agrega una dirección para calcular el precio exacto del domicilio
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="body-font font-medium text-neutral-black-80">
        Calcular domicilio desde:
      </label>
      <Select
        value={selectedLocationId}
        onValueChange={onSelect}
        disabled={isLoading || locations.length === 0}
      >
        <SelectTrigger className="text-neutral-black-50! body-font">
          <SelectValue
            placeholder={isLoading ? "Cargando ubicaciones..." : "Seleccionar ubicación"}
          />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-black-50" />
                <span>{location.name}</span>
                {location.favorite && (
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
