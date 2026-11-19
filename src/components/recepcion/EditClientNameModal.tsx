"use client";

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';

interface EditClientNameModalProps {
  currentName: string;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}

export function EditClientNameModal({ currentName, onSave, onClose }: EditClientNameModalProps) {
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(trimmed);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el nombre');
      setSaving(false);
    }
  };

  return (
    // `contents`: frena que los clics del portal suban a la fila/card clicable que contiene el modal
    <div className="contents" onClick={(e) => e.stopPropagation()}>
      <Modal
        open
        onOpenChange={(o) => { if (!o) onClose(); }}
        size="sm"
        title="Modificar nombre"
        headerIcon={<Pencil size={16} className="text-primary-red" />}
        dirty={name !== currentName}
        footer={{
          cancel: false,
          confirm: {
            label: 'Modificar nombre',
            variant: 'default',
            onClick: handleSave,
            loading: saving,
            disabled: !name.trim(),
            className: 'w-full',
          },
        }}
      >
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Nombre del cliente"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); } }}
            disabled={saving}
            autoFocus
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
