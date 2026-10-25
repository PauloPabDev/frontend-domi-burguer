"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import { FormModal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { Note, NoteKind, NotePhotoUpload, NOTE_MAX_PHOTOS, NOTE_MAX_TEXT } from '@/types/notes';
import { NOTE_KINDS, NOTE_KIND_ORDER } from './noteKinds';
import { PhotoPicker, PickedPhoto } from './PhotoPicker';

export interface NoteFormValues {
  kind: NoteKind;
  text: string;
  photos: NotePhotoUpload[];
}

interface NoteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Si se pasa, el modal edita esa nota; si no, crea una nueva */
  note?: Note | null;
  onSubmit: (values: NoteFormValues) => Promise<void>;
  /** Quita una foto ya guardada de la nota que se edita */
  onRemovePhoto?: (photoId: string) => Promise<void>;
}

export function NoteFormModal({ open, onOpenChange, note, onSubmit, onRemovePhoto }: NoteFormModalProps) {
  const isEdit = Boolean(note);
  const [kind, setKind] = useState<NoteKind>(note?.kind ?? 'tip');
  const [text, setText] = useState(note?.text ?? '');
  const [picked, setPicked] = useState<PickedPhoto[]>([]);
  const [saving, setSaving] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState<string | null>(null);

  const savedPhotos = note?.photos ?? [];
  const isEmpty = !text.trim() && picked.length === 0 && savedPhotos.length === 0;

  const handleSubmit = async () => {
    if (isEmpty || saving) return;
    setSaving(true);
    try {
      await onSubmit({ kind, text: text.trim(), photos: picked });
      onOpenChange(false);
    } catch {
      // el error ya se avisó con un toast; el modal queda abierto para reintentar sin perder la foto
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSaved = async (photoId: string) => {
    if (!onRemovePhoto) return;
    setRemovingPhoto(photoId);
    try {
      await onRemovePhoto(photoId);
    } catch {
      // el error ya se avisó con un toast
    } finally {
      setRemovingPhoto(null);
    }
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Editar nota' : 'Nueva nota'}
      description="Solo la ve el personal. Ayuda a quien atienda después."
      submitText={isEdit ? 'GUARDAR' : 'PUBLICAR'}
      loading={saving}
      submitDisabled={isEmpty}
      mobileBottomSheet
      onSubmit={handleSubmit}
    >
      <div>
        <p className="text-xs font-semibold text-neutral-black-50 mb-1.5">Tipo de nota</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {NOTE_KIND_ORDER.map((value) => {
            const config = NOTE_KINDS[value];
            const Icon = config.icon;
            return (
              <button
                key={value}
                type="button"
                title={config.hint}
                onClick={() => setKind(value)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-xs font-medium transition-colors',
                  kind === value ? config.active : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                )}
              >
                <Icon className="w-4 h-4" />
                {config.label}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-neutral-black-40 mt-1">{NOTE_KINDS[kind].hint}</p>
      </div>

      <div>
        <label htmlFor="note-text" className="block text-xs font-semibold text-neutral-black-50 mb-1">
          Nota
        </label>
        <textarea
          id="note-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={NOTE_MAX_TEXT}
          rows={4}
          placeholder="Ej: La puerta azul es la del fondo, el timbre no sirve: llamar al celular."
          className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-black-20 focus:outline-none focus:border-primary-red transition-colors bg-white resize-none"
        />
        <p className="text-[11px] text-neutral-black-40 text-right">
          {text.length}/{NOTE_MAX_TEXT}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold text-neutral-black-50 mb-1.5">Fotos</p>

        {savedPhotos.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {savedPhotos.map((photo, index) => (
              <div key={photo.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-neutral-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.thumbUrl} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                {onRemovePhoto && (
                  <button
                    type="button"
                    aria-label="Quitar foto"
                    disabled={removingPhoto === photo.id}
                    onClick={() => handleRemoveSaved(photo.id)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {isEdit ? (
          <p className="text-[11px] text-neutral-black-40">
            Para agregar fotos nuevas, crea otra nota. Aquí solo puedes quitar las que ya tiene.
          </p>
        ) : (
          <PhotoPicker photos={picked} onChange={setPicked} remaining={NOTE_MAX_PHOTOS} disabled={saving} />
        )}
      </div>
    </FormModal>
  );
}
