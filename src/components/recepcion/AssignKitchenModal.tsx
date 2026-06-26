"use client";

import { useState } from 'react';
import { X, ChefHat } from 'lucide-react';
import { WorkerKitchen } from '@/types/worker';
import { Button } from '@/components/ui/button';

interface AssignKitchenModalProps {
  kitchens: WorkerKitchen[];
  currentKitchenId?: string;
  onAssign: (kitchenId: string) => Promise<void>;
  onClose: () => void;
}

export const AssignKitchenModal: React.FC<AssignKitchenModalProps> = ({
  kitchens,
  currentKitchenId,
  onAssign,
  onClose,
}) => {
  const [selected, setSelected] = useState<string | null>(currentKitchenId ?? null);
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await onAssign(selected);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-black-10">
          <div className="flex items-center gap-2">
            <ChefHat size={16} className="text-primary-red" />
            <h3 className="font-bold text-sm text-neutral-black-80">Asignar cocina</h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-black-50 hover:text-neutral-black-80">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto p-3 space-y-1">
          {kitchens.map((kitchen) => (
            <button
              key={kitchen.id}
              onClick={() => setSelected(kitchen.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                selected === kitchen.id
                  ? 'border-primary-red bg-primary-red/5'
                  : 'border-transparent hover:bg-neutral-black-10'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-primary-red/10 flex items-center justify-center shrink-0">
                <ChefHat size={15} className="text-primary-red" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-black-80">{kitchen.name}</p>
                {kitchen.location && <p className="text-xs text-neutral-black-50">{kitchen.location}</p>}
              </div>
              {selected === kitchen.id && (
                <div className="ml-auto w-4 h-4 rounded-full bg-primary-red" />
              )}
            </button>
          ))}
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-neutral-black-10">
          <Button
            onClick={handleAssign}
            disabled={!selected}
            loading={loading}
            loadingText="Asignando..."
            fullWidth
            variant="primary"
          >
            Confirmar cocina
          </Button>
        </div>
      </div>
    </div>
  );
};
