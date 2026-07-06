"use client";

import { ChefHat } from 'lucide-react';
import { WorkerKitchen } from '@/types/worker';

interface SedeSelectorProps {
  kitchens: WorkerKitchen[];
  loading: boolean;
  value: string | null;
  detectedKitchen?: { name: string; address?: string } | null;
  onChange: (kitchenId: string | null) => void;
}

export function SedeSelector({ kitchens, loading, value, detectedKitchen, onChange }: SedeSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ChefHat className="w-4 h-4 text-primary-red" />
        <h3 className="font-bold text-sm text-neutral-black-80">Sede</h3>
      </div>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={loading}
        className="w-full rounded-lg border border-neutral-black-20 px-3 py-2 text-sm text-neutral-black-80 bg-white focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red disabled:opacity-50"
      >
        <option value="">Automático</option>
        {loading && <option disabled>Cargando sedes...</option>}
        {kitchens.map((k) => (
          <option key={k.id} value={k.id}>{k.name}</option>
        ))}
      </select>
      {!value && detectedKitchen && (
        <p className="text-xs text-neutral-black-40">
          Sede asignada: <span className="font-medium text-neutral-black-60">{detectedKitchen.name}</span>
          {detectedKitchen.address && ` · ${detectedKitchen.address}`}
        </p>
      )}
    </div>
  );
}
