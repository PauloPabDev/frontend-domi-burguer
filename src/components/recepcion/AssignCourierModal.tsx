"use client";

import { useState } from 'react';
import { X, Bike } from 'lucide-react';
import { WorkerUser } from '@/types/worker';
import { Button } from '@/components/ui/button';

interface AssignCourierModalProps {
  couriers: WorkerUser[];
  currentCourierId?: string;
  onAssign: (courierId: string) => Promise<void>;
  onClose: () => void;
}

export const AssignCourierModal: React.FC<AssignCourierModalProps> = ({
  couriers,
  currentCourierId,
  onAssign,
  onClose,
}) => {
  const [selected, setSelected] = useState<string | null>(currentCourierId ?? null);
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
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-black-10">
          <div className="flex items-center gap-2">
            <Bike size={16} className="text-primary-red" />
            <h3 className="font-bold text-sm text-neutral-black-80">Asignar domiciliario</h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-black-50 hover:text-neutral-black-80">
            <X size={16} />
          </button>
        </div>

        {/* Courier list */}
        <div className="max-h-64 overflow-y-auto p-3 space-y-1">
          {couriers.length === 0 ? (
            <p className="text-sm text-center text-neutral-black-50 py-6">No hay domiciliarios disponibles</p>
          ) : (
            couriers.map((courier) => (
              <button
                key={courier.id}
                onClick={() => setSelected(courier.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                  selected === courier.id
                    ? 'border-primary-red bg-primary-red/5'
                    : 'border-transparent hover:bg-neutral-black-10'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-primary-red/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary-red">
                  {courier.photoURL ? (
                    <img src={courier.photoURL} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    courier.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-black-80 truncate">{courier.name}</p>
                  {courier.phone && <p className="text-xs text-neutral-black-50">{courier.phone}</p>}
                </div>
                {selected === courier.id && (
                  <div className="w-4 h-4 rounded-full bg-primary-red shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-neutral-black-10">
          <Button
            onClick={handleAssign}
            disabled={!selected}
            loading={loading}
            loadingText="Asignando..."
            fullWidth
            variant="primary"
          >
            Confirmar asignación
          </Button>
        </div>
      </div>
    </div>
  );
};
