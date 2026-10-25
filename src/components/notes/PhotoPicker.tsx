"use client";

import { useEffect, useRef, useState } from 'react';
import { Camera, Images, Loader2, X } from 'lucide-react';
import { NotePhotoUpload, NOTE_MAX_PHOTOS } from '@/types/notes';
import { compressImage } from '@/utils/imageCompress';
import { notify } from '@/utils/notify';

/** Foto elegida: ya comprimida y con una vista previa local */
export interface PickedPhoto extends NotePhotoUpload {
  id: string;
  previewUrl: string;
}

interface PhotoPickerProps {
  photos: PickedPhoto[];
  onChange: (photos: PickedPhoto[]) => void;
  /** Cuántas fotos más caben (la nota admite 4 en total, contando las que ya tiene) */
  remaining?: number;
  disabled?: boolean;
}

export function PhotoPicker({ photos, onChange, remaining = NOTE_MAX_PHOTOS, disabled }: PhotoPickerProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  // las vistas previas son URLs locales: se liberan al desmontar
  const latest = useRef(photos);
  useEffect(() => { latest.current = photos; }, [photos]);
  useEffect(() => () => latest.current.forEach((p) => URL.revokeObjectURL(p.previewUrl)), []);

  const canAdd = !disabled && !processing && photos.length < remaining;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = remaining - photos.length;
    const selected = Array.from(files).slice(0, room);
    if (files.length > room) {
      notify.info('Límite de fotos', `Solo caben ${remaining} fotos por nota.`);
    }

    setProcessing(true);
    const added: PickedPhoto[] = [];
    for (const file of selected) {
      try {
        const compressed = await compressImage(file);
        added.push({
          ...compressed,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          previewUrl: URL.createObjectURL(compressed.thumb),
        });
      } catch {
        notify.error('Foto no válida', `No se pudo procesar "${file.name}".`);
      }
    }
    setProcessing(false);
    if (added.length > 0) onChange([...photos, ...added]);
  };

  const remove = (id: string) => {
    const removed = photos.find((p) => p.id === id);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    onChange(photos.filter((p) => p.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {photos.map((photo, index) => (
          <div key={photo.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-neutral-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.previewUrl} alt={`Foto nueva ${index + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              aria-label="Quitar foto"
              onClick={() => remove(photo.id)}
              disabled={disabled}
              className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {processing && (
          <div className="w-20 h-20 rounded-lg border border-dashed border-neutral-300 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
          </div>
        )}
      </div>

      {remaining > 0 && (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canAdd}
            onClick={() => cameraRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Camera className="w-4 h-4" />
            Tomar foto
          </button>
          <button
            type="button"
            disabled={!canAdd}
            onClick={() => galleryRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Images className="w-4 h-4" />
            Galería
          </button>
          <span className="ml-auto self-center text-xs text-neutral-400">
            {photos.length}/{remaining}
          </span>
        </div>
      )}

      {/* capture="environment" abre la cámara trasera en el celular; en escritorio es un selector de archivos */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}
