"use client";

import { useState } from 'react';
import { Loader2, NotebookPen, Plus } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/modal';
import { useNotes } from '@/hooks/notes/useNotes';
import { NotesApiError } from '@/services/notesService';
import { Note, NoteTargetType } from '@/types/notes';
import { notify } from '@/utils/notify';
import { NoteCard } from './NoteCard';
import { NoteFormModal, NoteFormValues } from './NoteFormModal';
import { PhotoLightbox } from './PhotoLightbox';

interface NotesPanelProps {
  targetType: NoteTargetType;
  targetId: string;
  title?: string;
}

type FormState = { mode: 'create' } | { mode: 'edit'; noteId: string } | null;

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof NotesApiError && error.status === 503) {
    return 'El almacenamiento de fotos no está disponible ahora. Guarda la nota sin fotos o inténtalo más tarde.';
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * Notas internas (texto + fotos) de un cliente, usuario de la app o ubicación, para ayudar
 * a los siguientes empleados. Solo las ve el personal; la API lo exige.
 */
export function NotesPanel({ targetType, targetId, title = 'Notas del personal' }: NotesPanelProps) {
  const {
    notes, loading, error, isAdmin, currentUserId,
    refetch, refreshExpiredPhotos, createNote, updateNote, removePhoto, removeNote,
  } = useNotes(targetType, targetId);

  const [form, setForm] = useState<FormState>(null);
  const [toDelete, setToDelete] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [lightbox, setLightbox] = useState<{ noteId: string; index: number } | null>(null);

  const editing = form?.mode === 'edit' ? notes.find((n) => n.id === form.noteId) ?? null : null;
  const lightboxNote = lightbox ? notes.find((n) => n.id === lightbox.noteId) : null;

  const handleSubmit = async (values: NoteFormValues) => {
    try {
      if (editing) {
        await updateNote(editing.id, { kind: values.kind, text: values.text });
        notify.success('Nota actualizada');
      } else {
        await createNote(values);
        notify.success('Nota publicada', 'El resto del equipo ya la puede ver.');
      }
    } catch (e) {
      notify.error('No se pudo guardar', errorMessage(e, 'Intenta de nuevo.'));
      throw e;
    }
  };

  const handleRemovePhoto = async (photoId: string) => {
    if (!editing) return;
    try {
      await removePhoto(editing.id, photoId);
    } catch (e) {
      notify.error('No se pudo quitar la foto', errorMessage(e, 'Intenta de nuevo.'));
      throw e;
    }
  };

  const handleTogglePin = async (note: Note) => {
    try {
      await updateNote(note.id, { pinned: !note.pinned });
    } catch (e) {
      notify.error('No se pudo cambiar', errorMessage(e, 'Intenta de nuevo.'));
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await removeNote(toDelete.id);
      notify.success('Nota eliminada');
    } catch (e) {
      notify.error('No se pudo eliminar', errorMessage(e, 'Intenta de nuevo.'));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 font-bold text-sm text-neutral-black-80">
          <NotebookPen className="w-4 h-4 text-neutral-black-50" />
          {title}
          {notes.length > 0 && (
            <span className="text-xs font-bold bg-neutral-black-10 text-neutral-black-50 rounded-full px-2 py-0.5">
              {notes.length}
            </span>
          )}
        </h3>
        <button
          type="button"
          onClick={() => setForm({ mode: 'create' })}
          disabled={loading || Boolean(error)}
          className="flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar nota
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-neutral-black-50 py-3">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando notas...
        </div>
      ) : error ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
          <span>{error}</span>
          <button type="button" onClick={refetch} className="font-semibold underline">
            Reintentar
          </button>
        </div>
      ) : notes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-black-20 px-3 py-4 text-center text-xs text-neutral-black-40">
          Aún no hay notas. Deja un consejo o una foto para quien atienda después.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isAdmin={isAdmin}
              canManage={isAdmin || note.userCreateId === currentUserId}
              onEdit={(n) => setForm({ mode: 'edit', noteId: n.id })}
              onDelete={setToDelete}
              onTogglePin={handleTogglePin}
              onOpenPhoto={(n, index) => setLightbox({ noteId: n.id, index })}
              onImageError={refreshExpiredPhotos}
            />
          ))}
        </div>
      )}

      {form && (
        // se monta solo mientras está abierto, así el formulario siempre arranca limpio
        <NoteFormModal
          open
          onOpenChange={(open) => !open && setForm(null)}
          note={editing}
          onSubmit={handleSubmit}
          onRemovePhoto={editing ? handleRemovePhoto : undefined}
        />
      )}

      <ConfirmModal
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="¿Eliminar esta nota?"
        message="Se borrará la nota junto con sus fotos. Esta acción no se puede deshacer."
        cancelText="Cancelar"
        confirmText="Sí, eliminar"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />

      {lightbox && lightboxNote && (
        <PhotoLightbox
          photos={lightboxNote.photos}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
          onImageError={refreshExpiredPhotos}
        />
      )}
    </section>
  );
}
