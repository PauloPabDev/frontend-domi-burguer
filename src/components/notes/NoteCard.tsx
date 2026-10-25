"use client";

import { Pencil, Pin, PinOff, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note } from '@/types/notes';
import { NOTE_KINDS, formatNoteDate, roleLabel } from './noteKinds';

interface NoteCardProps {
  note: Note;
  /** El autor o un admin puede editar y borrar */
  canManage: boolean;
  isAdmin: boolean;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onOpenPhoto: (note: Note, index: number) => void;
  onImageError?: () => void;
}

const ACTION_CLASS = 'p-1.5 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors';

export function NoteCard({ note, canManage, isAdmin, onEdit, onDelete, onTogglePin, onOpenPhoto, onImageError }: NoteCardProps) {
  const config = NOTE_KINDS[note.kind] ?? NOTE_KINDS.other;
  const Icon = config.icon;
  const role = roleLabel(note.authorRole);

  return (
    <article
      className={cn(
        'rounded-xl border p-3 flex flex-col gap-2',
        note.pinned ? 'border-accent-yellow-60 bg-accent-yellow-40/20' : 'border-neutral-100 bg-white'
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
          <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold', config.chip)}>
            <Icon className="w-3 h-3" />
            {config.label}
          </span>
          {note.pinned && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-black-50">
              <Pin className="w-3 h-3" />
              Fijada
            </span>
          )}
        </div>

        <div className="flex items-center shrink-0 -mr-1 -mt-1">
          {isAdmin && (
            <button
              type="button"
              aria-label={note.pinned ? 'Quitar de fijadas' : 'Fijar nota'}
              title={note.pinned ? 'Quitar de fijadas' : 'Fijar arriba'}
              onClick={() => onTogglePin(note)}
              className={ACTION_CLASS}
            >
              {note.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>
          )}
          {canManage && (
            <>
              <button type="button" aria-label="Editar nota" title="Editar" onClick={() => onEdit(note)} className={ACTION_CLASS}>
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Eliminar nota"
                title="Eliminar"
                onClick={() => onDelete(note)}
                className={cn(ACTION_CLASS, 'hover:bg-red-50 hover:text-red-500')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </header>

      {note.text && (
        <p className="text-sm text-neutral-800 whitespace-pre-wrap break-words">{note.text}</p>
      )}

      {note.photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {note.photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              aria-label={`Ver foto ${index + 1} de ${note.photos.length}`}
              onClick={() => onOpenPhoto(note, index)}
              className="w-20 h-20 rounded-lg overflow-hidden border border-neutral-200 hover:opacity-90 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbUrl}
                alt={`Foto ${index + 1}`}
                loading="lazy"
                onError={onImageError}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <footer className="text-[11px] text-neutral-400">
        {note.authorName || 'Empleado'}
        {role && ` · ${role}`} · {formatNoteDate(note.createdAt)}
      </footer>
    </article>
  );
}
