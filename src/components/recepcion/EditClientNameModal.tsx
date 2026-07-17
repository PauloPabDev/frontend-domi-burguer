"use client";

import { useState } from 'react';
import { X, Pencil, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-black-10">
          <div className="flex items-center gap-2">
            <Pencil size={16} className="text-primary-red" />
            <h3 className="font-bold text-sm text-neutral-black-80">Modificar nombre</h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-black-50 hover:text-neutral-black-80">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3">
          <Input
            placeholder="Nombre del cliente"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); } }}
            disabled={saving}
            autoFocus
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full h-11 font-bold"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Modificar nombre'}
          </Button>
        </div>
      </div>
    </div>
  );
}
