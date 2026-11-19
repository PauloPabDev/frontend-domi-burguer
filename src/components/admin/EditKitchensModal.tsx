"use client";

import { useState } from 'react';
import { ChefHat } from 'lucide-react';
import { WorkerKitchen } from '@/types/worker';
import { Modal } from '@/components/ui/modal';

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

  const dirty = selected.length !== currentKitchenIds.length || selected.some((id) => !currentKitchenIds.includes(id));

  return (
    <div className="contents" onClick={(e) => e.stopPropagation()}>
      <Modal
        open
        onOpenChange={(o) => { if (!o) onClose(); }}
        size="sm"
        title="Cocinas asignadas"
        headerIcon={<ChefHat size={16} className="text-primary-red" />}
        dirty={dirty}
        footer={{
          cancel: false,
          confirm: { label: 'Guardar cocinas', onClick: handleSave, loading, loadingText: 'Guardando...', className: 'w-full' },
        }}
      >
        <div className="max-h-64 overflow-y-auto space-y-2">
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

      </Modal>
    </div>
  );
};
