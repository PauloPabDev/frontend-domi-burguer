"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PushCampaign, PushCampaignInput } from '@/types/notifications';
import { NotificationService } from '@/services/notificationService';

export const useAdminPushCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<PushCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setCampaigns(await NotificationService.getCampaigns(await user.getIdToken()));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  // El backend responde apenas guarda la campaña; el envío sigue en segundo plano ("Enviando…")
  const sendCampaign = async (data: PushCampaignInput) => {
    if (!user) return;
    const campaign = await NotificationService.sendCampaign(data, await user.getIdToken());
    setCampaigns(prev => [campaign, ...prev]);
    return campaign;
  };

  return { campaigns, loading, error, refetch: fetchCampaigns, sendCampaign };
};
