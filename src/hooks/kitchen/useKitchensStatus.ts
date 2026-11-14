"use client";

import { useEffect, useState } from "react";
import { KitchenService } from "@/services/kitchenService";
import { KitchenOpenStatus } from "@/types/kitchens";

const REFETCH_MS = 60_000;
const TICK_MS = 30_000;

/**
 * Hora del servidor que avanza cada 30 s: toma el offset contra el reloj del dispositivo cuando llega `serverNow`.
 * Sin `serverNow` devuelve la hora del dispositivo.
 */
export function useServerNow(serverNow?: string | null) {
  const [deviceNow, setDeviceNow] = useState(() => Date.now());
  const [offsetMs, setOffsetMs] = useState(0);

  useEffect(() => {
    setOffsetMs(serverNow ? Date.parse(serverNow) - Date.now() : 0);
  }, [serverNow]);

  useEffect(() => {
    const tick = setInterval(() => setDeviceNow(Date.now()), TICK_MS);
    return () => clearInterval(tick);
  }, []);

  return deviceNow + offsetMs;
}

/**
 * Estado abierto/cerrado de las cocinas según el servidor.
 * `nowMs` = hora del servidor (offset medido al recibir la respuesta), que avanza cada 30 s
 * para que «cerramos en N min» baje sin recargar y sin depender del reloj del dispositivo.
 */
export function useKitchensStatus() {
  const [statuses, setStatuses] = useState<KitchenOpenStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { body } = await KitchenService.findKitchensStatusPublic();
        if (cancelled) return;
        setStatuses(body);
      } catch {
        // Sin datos la barra simplemente no se muestra; conserva el último estado conocido
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    const refetch = setInterval(load, REFETCH_MS);
    return () => {
      cancelled = true;
      clearInterval(refetch);
    };
  }, []);

  const nowMs = useServerNow(statuses[0]?.serverNow);

  return { statuses, isLoading, nowMs };
}
