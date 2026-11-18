"use client";

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PointsService } from '@/services/pointsService';
import { MANUAL_POINT_TYPES, POINT_FLOW_TYPES, Point } from '@/types/points';

const HISTORY_LIMIT = 50;

const isToday = (point: Point) =>
  new Date(point.createdAt._seconds * 1000).toDateString() === new Date().toDateString();

/**
 * Historial de puntos de cualquier usuario (recepción/admin), del más reciente al más viejo.
 * También calcula cuántos puntos manuales se le dieron hoy, para el tope diario de recepción.
 */
export function usePointsHistory(userId: string) {
  const { user } = useAuth();
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const token = await user.getIdToken();
      const response = await PointsService.getPointsByUserId(userId, token, HISTORY_LIMIT);
      setPoints(response.body);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar los puntos');
    } finally {
      setLoading(false);
    }
  }, [user, userId]);

  useEffect(() => {
    setLoading(true);
    refetch();
  }, [refetch]);

  // shortcut: el historial trae los últimos 50; si hoy hubiera más, el backend igual hace valer el tope
  const givenToday = points
    .filter((p) => p.flowType === POINT_FLOW_TYPES.INPUT && MANUAL_POINT_TYPES.includes(p.type) && isToday(p))
    .reduce((sum, p) => sum + p.points, 0);

  return { points, loading, error, refetch, givenToday };
}
