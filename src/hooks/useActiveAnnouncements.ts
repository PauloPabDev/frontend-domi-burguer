"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AnnouncementsService } from '@/services/announcementsService';
import { Announcement } from '@/types/announcements';

// En una PWA instalada la app casi nunca se recarga: al volver a ella tras este tiempo se consulta de nuevo
const REFRESH_AFTER_MS = 30 * 60 * 1000;

/**
 * Avisos vigentes para este visitante. Espera a que se resuelva la sesión (la audiencia depende de ella)
 * y vuelve a consultar cuando alguien inicia o cierra sesión.
 */
export function useActiveAnnouncements() {
  const { user, loading: authLoading } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef(0);

  const userRef = useRef(user);
  userRef.current = user;
  const uid = user?.uid ?? null;

  const load = useCallback(async (force = false) => {
    try {
      const currentUser = userRef.current;
      const token = currentUser ? await currentUser.getIdToken() : undefined;
      const { body } = await AnnouncementsService.getActive(token, force);
      setAnnouncements(Array.isArray(body) ? body : []);
      setError(null);
      lastFetchRef.current = Date.now();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al obtener los avisos');
    } finally {
      setLoading(false);
    }
    // uid: al cambiar de sesión hay que volver a pedirlos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading, load]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastFetchRef.current < REFRESH_AFTER_MS) return;
      load(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const refetch = useCallback(() => load(true), [load]);

  return { announcements, loading, error, refetch };
}
