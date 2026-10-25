"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { NotePhoto } from '@/types/notes';

interface PhotoLightboxProps {
  photos: NotePhoto[];
  startIndex: number;
  onClose: () => void;
  onImageError?: () => void;
}

/** Visor de fotos a pantalla completa: flechas, Esc, clic fuera y deslizar en el celular. */
export function PhotoLightbox({ photos, startIndex, onClose, onImageError }: PhotoLightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const total = photos.length;

  const go = (delta: number) => setIndex((current) => (current + delta + total) % total);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex((current) => (current - 1 + total) % total);
      if (e.key === 'ArrowRight') setIndex((current) => (current + 1) % total);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, total]);

  const photo = photos[index];
  if (!photo) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/90"
      onClick={onClose}
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStart === null || total < 2) return;
        const delta = e.changedTouches[0].clientX - touchStart;
        if (Math.abs(delta) > 50) go(delta > 0 ? -1 : 1);
        setTouchStart(null);
      }}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            className="absolute left-2 sm:left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            aria-label="Foto siguiente"
            onClick={(e) => { e.stopPropagation(); go(1); }}
            className="absolute right-2 sm:right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/80 bg-black/40 rounded-full px-3 py-1">
            {index + 1} / {total}
          </span>
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={`Foto ${index + 1} de ${total}`}
        onClick={(e) => e.stopPropagation()}
        onError={onImageError}
        className="max-h-[90vh] max-w-[95vw] object-contain rounded-lg select-none"
      />
    </div>,
    document.body
  );
}
