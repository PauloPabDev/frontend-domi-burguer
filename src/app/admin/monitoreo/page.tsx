"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, ChefHat, Radio, RefreshCw, ShieldCheck, Truck, Users, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MonitoringService, SocketConnectionEntry, SocketConnectionsSnapshot } from '@/services/monitoringService';

const POLL_INTERVAL_MS = 15_000;

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  reception: 'Recepción',
  cook: 'Cocina',
  courier: 'Domiciliario',
  supervisor: 'Supervisor',
};

const ROLE_ICONS: Record<string, typeof Users> = {
  admin: ShieldCheck,
  reception: Radio,
  cook: ChefHat,
  courier: Truck,
  supervisor: Users,
};

// Colapsa segmentos dinámicos (ids de pedido, códigos, etc.) para que
// clientes en distintas páginas de detalle no exploten en N grupos de 1.
// El backend no conoce las rutas del frontend a propósito: esta normalización
// es puramente de presentación y vive acá.
function normalizePageForGrouping(page: string | null): string {
  if (!page) return 'Desconocida';
  return page
    .split('/')
    .map((segment) => {
      if (!segment) return segment;
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) return ':id';
      if (/^\d+$/.test(segment)) return ':id';
      if (segment.length >= 12 && /\d/.test(segment)) return ':id';
      return segment;
    })
    .join('/');
}

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

function SummaryCard({ icon: Icon, label, value, hint, color }: {
  icon: typeof Users;
  label: string;
  value: number;
  hint?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl border border-neutral-black-20 bg-white">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-neutral-black-80 leading-none">{value}</p>
        <p className="text-sm text-neutral-black-50 mt-1">{label}</p>
        {hint && <p className="text-xs text-neutral-black-40">{hint}</p>}
      </div>
    </div>
  );
}

function WorkerRow({ entry }: { entry: SocketConnectionEntry }) {
  const Icon = (entry.role && ROLE_ICONS[entry.role]) || Users;
  const roleLabel = (entry.role && ROLE_LABELS[entry.role]) || entry.role || '—';
  return (
    <tr className="border-t border-neutral-black-10">
      <td className="py-2.5 pr-3">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-neutral-black-50 shrink-0" />
          <span className="font-medium text-neutral-black-80">{roleLabel}</span>
        </div>
      </td>
      <td className="py-2.5 pr-3 text-neutral-black-50 truncate max-w-[220px]">{entry.email || '—'}</td>
      <td className="py-2.5 pr-3 text-neutral-black-50">{entry.kitchenId || '—'}</td>
      <td className="py-2.5 pr-3 font-mono text-xs text-neutral-black-80 truncate max-w-[240px]">{entry.page || '—'}</td>
      <td className="py-2.5 text-neutral-black-40 text-xs whitespace-nowrap">hace {timeAgo(entry.connectedAt)}</td>
    </tr>
  );
}

export default function AdminMonitoreoPage() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<SocketConnectionsSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSnapshot = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const data = await MonitoringService.getConnectionsStatus(token);
      setSnapshot(data);
      setError(null);
    } catch {
      setError('No se pudo actualizar el estado de conexiones');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSnapshot();
    const interval = setInterval(fetchSnapshot, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchSnapshot]);

  const clientsByPage = useMemo(() => {
    if (!snapshot) return [];
    const map = new Map<string, number>();
    snapshot.clients.forEach((c) => {
      const key = normalizePageForGrouping(c.page);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [snapshot]);

  const workersSorted = useMemo(() => {
    if (!snapshot) return [];
    return [...snapshot.workers].sort((a, b) => (a.role || '').localeCompare(b.role || ''));
  }, [snapshot]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center">
            <Activity size={20} className="text-primary-red" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-black-80">Monitoreo de conexiones</h1>
            <p className="text-xs text-neutral-black-50">Clientes y trabajadores conectados por WebSocket, en tiempo casi real</p>
          </div>
        </div>
        <button
          onClick={fetchSnapshot}
          className="p-1.5 rounded-full text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10 transition-colors"
          title="Actualizar ahora"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {loading && !snapshot ? (
        <div className="flex items-center justify-center py-16 gap-3 text-neutral-black-50">
          <Loader2 size={24} className="animate-spin" />
          <p className="text-sm">Cargando estado de conexiones...</p>
        </div>
      ) : error && !snapshot ? (
        <div className="text-center py-16 text-sm text-red-500">{error}</div>
      ) : snapshot ? (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <SummaryCard
              icon={Activity}
              label="Conexiones activas"
              value={snapshot.summary.total}
              color="bg-neutral-black-10 text-neutral-black-80"
            />
            <SummaryCard
              icon={Users}
              label="Clientes conectados"
              value={snapshot.summary.clients.uniqueUsers}
              hint={`${snapshot.summary.clients.sockets} conexión(es) activa(s)`}
              color="bg-blue-50 text-blue-600"
            />
            <SummaryCard
              icon={ShieldCheck}
              label="Trabajadores conectados"
              value={snapshot.summary.workers.uniqueUsers}
              hint={Object.entries(snapshot.summary.workers.byRole)
                .map(([role, count]) => `${ROLE_LABELS[role] || role}: ${count}`)
                .join(' · ') || undefined}
              color="bg-violet-50 text-violet-600"
            />
          </div>

          {/* Trabajadores */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-neutral-black-80 mb-3">Trabajadores</h2>
            {workersSorted.length === 0 ? (
              <div className="text-sm text-neutral-black-50 py-6 text-center border border-neutral-black-20 rounded-2xl">
                No hay trabajadores conectados
              </div>
            ) : (
              <div className="border border-neutral-black-20 rounded-2xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-neutral-black-40 bg-neutral-black-5">
                      <th className="py-2.5 px-3 font-medium">Rol</th>
                      <th className="py-2.5 px-3 font-medium">Usuario</th>
                      <th className="py-2.5 px-3 font-medium">Sede</th>
                      <th className="py-2.5 px-3 font-medium">Página</th>
                      <th className="py-2.5 px-3 font-medium">Conectado</th>
                    </tr>
                  </thead>
                  <tbody className="px-3">
                    {workersSorted.map((entry) => (
                      <WorkerRow key={entry.socketId} entry={entry} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Clientes agrupados por página */}
          <div>
            <h2 className="text-sm font-bold text-neutral-black-80 mb-3">Clientes por página</h2>
            {clientsByPage.length === 0 ? (
              <div className="text-sm text-neutral-black-50 py-6 text-center border border-neutral-black-20 rounded-2xl">
                No hay clientes conectados
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {clientsByPage.map(([page, count]) => (
                  <div
                    key={page}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-neutral-black-20 bg-white"
                  >
                    <span className="font-mono text-xs text-neutral-black-80 truncate">{page}</span>
                    <span className="text-sm font-bold text-neutral-black-80 shrink-0">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
