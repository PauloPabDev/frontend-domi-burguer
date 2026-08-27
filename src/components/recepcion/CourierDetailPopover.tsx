"use client";

import { useEffect, useState } from 'react';
import { Battery, Gauge, Clock, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CourierLocation } from '@/types/courierLocation';
import { WorkerUser, WorkerOrder, STATUS_CONFIG } from '@/types/worker';
import { TraccarService } from '@/services/traccarService';
import { cn } from '@/lib/utils';

interface CourierDetailPopoverProps {
  deviceId: string;
  courierLocation: CourierLocation;
  /** Usuario real de la app, resuelto por email (id_arceliuz) — undefined si el device no está vinculado */
  appCourier?: WorkerUser;
  /** Pedidos ya filtrados: asignados a este domiciliario y no entregados/cancelados */
  activeOrders: WorkerOrder[];
  onClose: () => void;
}

/** Traccar reporta la batería bajo distinta llave según el protocolo del GPS del dispositivo */
function extractBatteryLevel(attributes: Record<string, unknown> | undefined): number | null {
  if (!attributes) return null;
  const raw = attributes.batteryLevel ?? attributes.battery;
  return typeof raw === 'number' ? Math.round(raw) : null;
}

function formatSecondsAgo(seconds: number): string {
  if (seconds < 60) return `hace ${seconds}s`;
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`;
  return `hace ${Math.floor(seconds / 3600)}h`;
}

/**
 * Detalle de un domiciliario al hacer click en su pin en el mapa de recepción:
 * su identidad real en la app (foto/nombre), telemetría de Traccar (batería,
 * velocidad, hace cuánto se actualizó) y los pedidos que tiene activos ahora.
 */
export function CourierDetailPopover({
  deviceId,
  courierLocation,
  appCourier,
  activeOrders,
  onClose,
}: CourierDetailPopoverProps) {
  const { user } = useAuth();
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [loadingBattery, setLoadingBattery] = useState(true);
  const [, setTick] = useState(0);

  // Fuerza un re-render cada segundo para que "hace Xs" avance mientras el popover está abierto
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // La batería no viaja por el socket en vivo (el snapshot solo trae lat/lng/speed),
  // así que se pide fresca a Traccar cada vez que se abre el detalle de este device.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoadingBattery(true);

    (async () => {
      try {
        const token = await user.getIdToken();
        const data = await TraccarService.getDeviceAttributesById(token, deviceId);
        if (!cancelled) setBatteryLevel(extractBatteryLevel(data?.attributes));
      } catch {
        if (!cancelled) setBatteryLevel(null);
      } finally {
        if (!cancelled) setLoadingBattery(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [deviceId, user]);

  // Traccar reporta la velocidad en nudos; se muestra en km/h, más intuitivo para el equipo
  const speedKmh =
    typeof courierLocation.speed === 'number' ? Math.round(courierLocation.speed * 1.852) : null;

  const fixTime = courierLocation.fixTime ?? courierLocation.lastUpdate;
  const secondsAgo = fixTime ? Math.max(0, Math.floor((Date.now() - new Date(fixTime).getTime()) / 1000)) : null;

  const displayName = appCourier?.name ?? courierLocation.name;

  return (
    <div
      className="bg-white rounded-2xl shadow-xl border border-neutral-black-10 w-64 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Identidad: foto/nombre reales de la app en vez del id crudo de Traccar */}
      <div className="flex items-center gap-2.5 p-3 border-b border-neutral-black-10">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-red/10 flex items-center justify-center shrink-0">
          {appCourier?.photoURL ? (
            <img src={appCourier.photoURL} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary-red font-bold text-sm">{displayName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutral-black-90 truncate">{displayName}</p>
          <p
            className={cn(
              'text-xs font-medium',
              courierLocation.status === 'online' ? 'text-[#1f8a3b]' : 'text-neutral-black-40',
            )}
          >
            {courierLocation.status === 'online' ? 'En línea' : 'Desconectado'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-black-30 hover:text-neutral-black-60 transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {/* Telemetría de Traccar */}
      <div className="grid grid-cols-3 gap-1 p-3 border-b border-neutral-black-10">
        <Stat
          icon={<Battery size={14} />}
          label="Batería"
          value={loadingBattery ? '...' : batteryLevel != null ? `${batteryLevel}%` : 'N/D'}
        />
        <Stat icon={<Gauge size={14} />} label="Velocidad" value={speedKmh != null ? `${speedKmh} km/h` : 'N/D'} />
        <Stat
          icon={<Clock size={14} />}
          label="Actualizado"
          value={secondsAgo != null ? formatSecondsAgo(secondsAgo) : 'N/D'}
        />
      </div>

      {/* Pedidos que tiene activos en este momento */}
      <div className="p-3 max-h-40 overflow-y-auto">
        <p className="text-xs font-semibold text-neutral-black-60 mb-1.5">
          Pedidos activos ({activeOrders.length})
        </p>
        {!appCourier ? (
          <p className="text-xs text-neutral-black-40">Dispositivo sin vincular a un usuario de la app</p>
        ) : activeOrders.length === 0 ? (
          <p className="text-xs text-neutral-black-40">Sin pedidos asignados en este momento</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {activeOrders.map((o) => (
              <li key={o.id} className="text-xs text-neutral-black-70 flex items-center gap-1.5">
                <span className="font-semibold shrink-0">#{o.dailyOrderNumber}</span>
                <span className="truncate flex-1">{o.client?.name ?? 'Cliente'}</span>
                <span
                  className={cn(
                    'shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
                    STATUS_CONFIG[o.status]?.bg,
                    STATUS_CONFIG[o.status]?.color,
                  )}
                >
                  {STATUS_CONFIG[o.status]?.label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <div className="text-neutral-black-40">{icon}</div>
      <span className="text-[10px] text-neutral-black-40">{label}</span>
      <span className="text-xs font-semibold text-neutral-black-80">{value}</span>
    </div>
  );
}
