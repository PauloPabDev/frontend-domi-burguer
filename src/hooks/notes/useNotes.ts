"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Note, NoteCreateInput, NoteTargetType, NoteUpdateInput } from '@/types/notes';
import { NotesService } from '@/services/notesService';

// Las URLs de las fotos caducan (la API las firma por ~1-2 h): como mucho se renuevan cada 30 s
const REFRESH_MIN_INTERVAL_MS = 30_000;

/** Notas de un cliente, usuario o ubicación. El orden (fijadas primero, luego recientes) lo da la API. */
export const useNotes = (targetType: NoteTargetType, targetId: string | undefined) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const lastRefresh = useRef(0);

  const fetchNotes = useCallback(async () => {
    if (!user || !targetId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      // los roles viajan en los claims del token: así se sabe si es admin sin otra petición
      const { token, claims } = await user.getIdTokenResult();
      setIsAdmin(Array.isArray(claims.roles) && claims.roles.includes('admin'));
      const { body } = await NotesService.getByTarget(token, targetType, targetId);
      setNotes(body);
      lastRefresh.current = Date.now();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar las notas');
    } finally {
      setLoading(false);
    }
  }, [user, targetType, targetId]);

  useEffect(() => {
    setLoading(true);
    fetchNotes();
  }, [fetchNotes]);

  /** Si una foto no carga (URL caducada), se vuelven a pedir las notas para renovar las URLs. */
  const refreshExpiredPhotos = useCallback(() => {
    if (Date.now() - lastRefresh.current < REFRESH_MIN_INTERVAL_MS) return;
    lastRefresh.current = Date.now();
    fetchNotes();
  }, [fetchNotes]);

  const createNote = async (input: Omit<NoteCreateInput, 'targetType' | 'targetId'>) => {
    if (!user || !targetId) return;
    const token = await user.getIdToken();
    const { body } = await NotesService.create(token, { ...input, targetType, targetId });
    // las fijadas siguen arriba: la nueva va justo después de ellas
    setNotes((prev) => {
      const pinned = prev.filter((n) => n.pinned);
      return [...pinned, body, ...prev.filter((n) => !n.pinned)];
    });
    return body;
  };

  const updateNote = async (id: string, changes: NoteUpdateInput) => {
    if (!user) return;
    const token = await user.getIdToken();
    const { body } = await NotesService.update(token, id, changes);
    setNotes((prev) => prev.map((n) => (n.id === id ? body : n)));
    // fijar o desfijar cambia el orden: se pide la lista otra vez
    if ('pinned' in changes) fetchNotes();
    return body;
  };

  const removePhoto = async (id: string, photoId: string) => {
    if (!user) return;
    const token = await user.getIdToken();
    const { body } = await NotesService.deletePhoto(token, id, photoId);
    setNotes((prev) => prev.map((n) => (n.id === id ? body : n)));
    return body;
  };

  const removeNote = async (id: string) => {
    if (!user) return;
    const token = await user.getIdToken();
    await NotesService.remove(token, id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notes,
    loading,
    error,
    isAdmin,
    currentUserId: user?.uid ?? null,
    refetch: fetchNotes,
    refreshExpiredPhotos,
    createNote,
    updateNote,
    removePhoto,
    removeNote,
  };
};
