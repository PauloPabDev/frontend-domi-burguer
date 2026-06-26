"use client";

import { useState } from 'react';
import { X, ChefHat } from 'lucide-react';
import { WorkerKitchen } from '@/types/worker';
import { Button } from '@/components/ui/button';

interface EditKitchensModalProps {
  kitchens: WorkerKitchen[];
  currentKitchenIds: string[];
  onSave: (ids: string[]) => Promise<void>;
  onClose: () => void;
}

export const EditKitchensModal: React.FC<EditKitchensModalProps> = ({
  kitchens,
  currentKitchenIds,
  onSave,
  onClose,
}) => {
  const [selected, setSelected] = useState<string[]>(currentKitchenIds);
  const [loading, setLoading] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setLoading(true);
    try { await onSave(selected); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-black-10">
          <div className="flex items-center gap-2">
            <ChefHat size={16} className="text-primary-red" />
            <h3 className="font-bold text-sm text-neutral-black-80">Cocinas asignadas</h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-black-50 hover:text-neutral-black-80">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto p-4 space-y-2">
          {kitchens.length === 0 ? (
            <p className="text-sm text-center text-neutral-black-50 py-4">No hay cocinas disponibles</p>
          ) : (
            kitchens.map((kitchen) => (
              <label
                key={kitchen.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selected.includes(kitchen.id) ? 'border-primary-red bg-primary-red/5' : 'border-neutral-black-20 hover:bg-neutral-black-10'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(kitchen.id)}
                  onChange={() => toggle(kitchen.id)}
                  className="w-4 h-4 accent-red-600"
                />
                <div>
                  <p className="text-sm font-semibold text-neutral-black-80">{kitchen.name}</p>
                  {kitchen.location && <p className="text-xs text-neutral-black-50">{kitchen.location}</p>}
                </div>
              </label>
            ))
          )}
        </div>

        <div className="px-5 pb-5 pt-1 border-t border-neutral-black-10">
          <Button onClick={handleSave} loading={loading} loadingText="Guardando..." fullWidth variant="primary">
            Guardar cocinas
          </Button>
        </div>
      </div>
    </div>
  );
};
