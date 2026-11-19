"use client";

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/modal';

export const AVAILABLE_ROLES = [
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

  const dirty = selected.length !== currentRoles.length || selected.some((r) => !currentRoles.includes(r));

  return (
    <div className="contents" onClick={(e) => e.stopPropagation()}>
      <Modal
        open
        onOpenChange={(o) => { if (!o) onClose(); }}
        size="sm"
        title="Editar roles"
        headerIcon={<ShieldCheck size={16} className="text-primary-red" />}
        dirty={dirty}
        footer={{
          cancel: false,
          confirm: { label: 'Guardar roles', onClick: handleSave, loading, loadingText: 'Guardando...', className: 'w-full' },
        }}
      >
        <div className="space-y-2">
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

      </Modal>
    </div>
  );
};
