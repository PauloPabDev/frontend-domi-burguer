"use client";

import { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AVAILABLE_ROLES = [
  { value: 'admin',     label: 'Admin',      description: 'Acceso total al sistema' },
  { value: 'reception', label: 'Recepción',  description: 'Gestión de pedidos y clientes' },
  { value: 'cook',      label: 'Cocina',     description: 'Preparación de pedidos' },
  { value: 'courier',   label: 'Domicilio',  description: 'Entrega de pedidos' },
];

interface EditRolesModalProps {
  currentRoles: string[];
  onSave: (roles: string[]) => Promise<void>;
  onClose: () => void;
}

export const EditRolesModal: React.FC<EditRolesModalProps> = ({ currentRoles, onSave, onClose }) => {
  const [selected, setSelected] = useState<string[]>(currentRoles);
  const [loading, setLoading] = useState(false);

  const toggle = (role: string) => {
    setSelected((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
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
            <ShieldCheck size={16} className="text-primary-red" />
            <h3 className="font-bold text-sm text-neutral-black-80">Editar roles</h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-black-50 hover:text-neutral-black-80">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {AVAILABLE_ROLES.map(({ value, label, description }) => (
            <label
              key={value}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                selected.includes(value) ? 'border-primary-red bg-primary-red/5' : 'border-neutral-black-20 hover:bg-neutral-black-10'
              }`}
            >
              <input
                type="checkbox"
                checked={selected.includes(value)}
                onChange={() => toggle(value)}
                className="w-4 h-4 accent-red-600"
              />
              <div>
                <p className="text-sm font-semibold text-neutral-black-80">{label}</p>
                <p className="text-xs text-neutral-black-50">{description}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="px-5 pb-5 pt-1 border-t border-neutral-black-10">
          <Button onClick={handleSave} loading={loading} loadingText="Guardando..." fullWidth variant="primary">
            Guardar roles
          </Button>
        </div>
      </div>
    </div>
  );
};
