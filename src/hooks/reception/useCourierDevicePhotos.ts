"use client";

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CourierLocation } from '@/types/courierLocation';
import { WorkerUser } from '@/types/worker';
import { TraccarService } from '@/services/traccarService';

/**
 * Cruza la ubicación en vivo de Traccar con los domiciliarios de la app.
 *
 * Cada device en Traccar puede tener el atributo personalizado `id_arceliuz`
 * con el email del domiciliario asociado en la app. Por cada domiciliario que
 * llega en `courierLocations` se pide (en paralelo, no en serie) su detalle
 * completo a `GET /traccar/devices/:id` para leer ese atributo, y con el
 * email se busca su usuario real (nombre/foto) en `allCouriers`.
 *
 * El email resuelto se cachea en memoria por device id: no cambia con cada
 * actualización de posición en vivo, así que solo se pide una vez por
 * domiciliario nuevo que aparezca.
 */
export function useCourierDevicePhotos(
  courierLocations: CourierLocation[],
  allCouriers: WorkerUser[],
): Map<string, WorkerUser> {
  const { user } = useAuth();
  // deviceId -> id_arceliuz (o null si el device no lo tiene / no se pudo resolver)
  const [emailByDeviceId, setEmailByDeviceId] = useState<Map<string, string | null>>(new Map());
  const pendingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const idsToResolve = courierLocations
      .map((c) => c.id)
      .filter((id) => !emailByDeviceId.has(id) && !pendingRef.current.has(id));

    if (idsToResolve.length === 0) return;

    idsToResolve.forEach((id) => pendingRef.current.add(id));
    let cancelled = false;

    (async () => {
      const token = await user.getIdToken();

      // Búsqueda asíncrona en paralelo de cada domiciliario en devices/:id
      const results = await Promise.all(
        idsToResolve.map(async (id) => {
          try {
            const data = await TraccarService.getDeviceAttributesById(token, id);
            const email = data?.attributes?.id_arceliuz;
            return [id, typeof email === 'string' ? email : null] as const;
          } catch {
            return [id, null] as const;
          } finally {
            pendingRef.current.delete(id);
          }
        }),
      );

      if (cancelled) return;
      setEmailByDeviceId((prev) => {
        const next = new Map(prev);
        results.forEach(([id, email]) => next.set(id, email));
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [courierLocations, user, emailByDeviceId]);

  const courierByDeviceId = new Map<string, WorkerUser>();
  courierLocations.forEach((c) => {
    const email = emailByDeviceId.get(c.id);
    if (!email) return;
    const match = allCouriers.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (match) courierByDeviceId.set(c.id, match);
  });

  return courierByDeviceId;
}
