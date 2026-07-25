"use client";

import { Loader2, MapPin } from 'lucide-react';
import { Location } from '@/types/locations';
import { LocationCard } from '@/components/recepcion/LocationCard';

interface PersonaLocationsSectionProps {
  locations: Location[];
  loading: boolean;
}

const noop = () => {};

export function PersonaLocationsSection({ locations, loading }: PersonaLocationsSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-neutral-black-80">Direcciones</h3>
        {locations.length > 0 && (
          <span className="text-xs font-bold bg-neutral-black-10 text-neutral-black-50 rounded-full px-2 py-0.5">
            {locations.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-neutral-black-50 py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando direcciones...
        </div>
      ) : locations.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-neutral-black-40 border border-dashed border-neutral-black-20 rounded-xl">
          <MapPin className="w-6 h-6 opacity-40" />
          <p className="text-xs">Sin direcciones registradas</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
          {locations.map((location) => (
            <LocationCard key={location.id} location={location} isSelected={false} onSelect={noop} />
          ))}
        </div>
      )}
    </div>
  );
}
