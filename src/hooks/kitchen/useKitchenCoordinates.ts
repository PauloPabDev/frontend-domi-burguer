"use client";

import { useEffect, useState } from 'react';
import { WorkerKitchen } from '@/types/worker';
import { LocationService } from '@/services/locationService';

type Coords = { lat: number; lng: number };

// A nivel de módulo: cada sede se consulta una sola vez por carga de la página,
// aunque se navegue entre pantallas o el componente se vuelva a montar.
const requests = new Map<string, Promise<Coords | null>>();

function fetchCoords(locationId: string) {
  let req = requests.get(locationId);
  if (!req) {
    req = LocationService.getLocationByIdPublic(locationId)
      .then(({ body }) => body?.coordinates ?? null)
      .catch(() => null);
    requests.set(locationId, req);
  }
  return req;
}

/** Coordenadas de cada cocina (por id), sacadas de su locationId. */
export function useKitchenCoordinates(kitchens: WorkerKitchen[]) {
  const [coords, setCoords] = useState<Map<string, Coords>>(new Map());

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      kitchens.map(async (k) => [k.id, k.locationId ? await fetchCoords(k.locationId) : null] as const),
    ).then((entries) => {
      if (cancelled) return;
      setCoords(new Map(entries.filter((e): e is [string, Coords] => e[1] !== null)));
    });
    return () => { cancelled = true; };
  }, [kitchens]);

  return coords;
}
