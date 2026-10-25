"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminAnnouncement, AnnouncementInput } from '@/types/announcements';
import { AnnouncementsService } from '@/services/announcementsService';

export const useAdminAnnouncements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const { body } = await AnnouncementsService.getAll(token);
      setAnnouncements(body ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar los avisos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const createAnnouncement = async (data: AnnouncementInput) => {
    if (!user) return;
    const token = await user.getIdToken();
    const { body } = await AnnouncementsService.create(token, data);
    if (body) setAnnouncements(prev => [body, ...prev]);
    return body;
  };

  const updateAnnouncement = async (id: string, data: AnnouncementInput) => {
    if (!user) return;
    const token = await user.getIdToken();
    const { body } = await AnnouncementsService.update(token, id, data);
    if (body) setAnnouncements(prev => prev.map(a => (a.id === id ? body : a)));
    return body;
  };

  const archiveAnnouncement = async (id: string) => {
    if (!user) return;
    const token = await user.getIdToken();
    await AnnouncementsService.archive(token, id);
    setAnnouncements(prev => prev.map(a => (a.id === id ? { ...a, status: 'archived' } : a)));
  };

  return {
    announcements,
    loading,
    error,
    refetch: fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    archiveAnnouncement,
  };
};
