"use client";

import { MapPin } from 'lucide-react';
import { Location } from '@/types/locations';
import { cn } from '@/lib/utils';

interface LocationCardProps {
  location: Location;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function LocationCard({ location, isSelected, onSelect }: LocationCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(location.id)}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border text-left transition-colors w-full',
        isSelected
          ? 'border-green-500 bg-green-50'
          : 'border-neutral-black-20 hover:border-neutral-black-40 bg-white'
      )}
    >
      <div className={cn(
        'mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center',
        isSelected ? 'border-green-500' : 'border-neutral-black-30'
      )}>
        {isSelected && <div className="w-2 h-2 rounded-full bg-green-500" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-neutral-black-80 truncate">{location.name}</p>
        <p className="text-xs text-neutral-black-50 truncate">{location.address}</p>
        {location.floor && (
          <p className="text-xs text-neutral-black-40">Piso / Apto: {location.floor}</p>
        )}
      </div>

      <MapPin className="w-3.5 h-3.5 text-neutral-black-30 shrink-0 mt-0.5" />
    </button>
  );
}
