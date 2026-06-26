"use client";

import { ChefHat, Loader2 } from 'lucide-react';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';

export default function AdminCocinasPage() {
  const { kitchens, loading } = useKitchenSelector();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg font-bold text-neutral-black-80 mb-5">Cocinas</h1>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-neutral-black-50">
          <Loader2 size={24} className="animate-spin" />
          <p className="text-sm">Cargando cocinas...</p>
        </div>
      ) : kitchens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-black-50 border border-neutral-black-20 rounded-2xl">
          <ChefHat size={40} className="opacity-30" />
          <p className="text-sm">No hay cocinas registradas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {kitchens.map((kitchen) => (
            <div key={kitchen.id} className="flex items-center gap-3 p-4 rounded-2xl border border-neutral-black-20 bg-white">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                <ChefHat size={18} className="text-violet-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-neutral-black-80">{kitchen.name}</p>
                {kitchen.location && (
                  <p className="text-xs text-neutral-black-50">{kitchen.location}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
