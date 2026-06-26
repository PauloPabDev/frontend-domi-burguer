"use client";

import { ChefHat, Loader2 } from 'lucide-react';
import { WorkerKitchen } from '@/types/worker';

interface KitchenSelectorProps {
  kitchens: WorkerKitchen[];
  loading: boolean;
  onSelect: (id: string) => void;
}

export const KitchenSelector: React.FC<KitchenSelectorProps> = ({ kitchens, loading, onSelect }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-black-50">
        <Loader2 size={32} className="animate-spin" />
        <p className="text-sm">Cargando cocinas...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-12 px-4 gap-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary-red/10 flex items-center justify-center mx-auto mb-3">
          <ChefHat size={28} className="text-primary-red" />
        </div>
        <h2 className="text-lg font-bold text-neutral-black-80">Selecciona tu cocina</h2>
        <p className="text-sm text-neutral-black-50 mt-1">Elige la cocina en la que trabajas hoy</p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        {kitchens.length === 0 ? (
          <p className="text-sm text-center text-neutral-black-50">No hay cocinas disponibles</p>
        ) : (
          kitchens.map((kitchen) => (
            <button
              key={kitchen.id}
              onClick={() => onSelect(kitchen.id)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl border border-neutral-black-20 bg-white hover:border-primary-red hover:bg-primary-red/5 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center shrink-0">
                <ChefHat size={18} className="text-primary-red" />
              </div>
              <div>
                <p className="font-semibold text-sm text-neutral-black-80">{kitchen.name}</p>
                {kitchen.location && (
                  <p className="text-xs text-neutral-black-50">{kitchen.location}</p>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
