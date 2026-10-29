"use client";

import { Loader2, RefreshCw, BellRing } from 'lucide-react';
import { useAdminPushCampaigns } from '@/hooks/admin/useAdminPushCampaigns';
import { PushCampaignForm, AUDIENCE_OPTIONS } from '@/components/admin/PushCampaignForm';
import { AVAILABLE_ROLES } from '@/components/admin/EditRolesModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PushCampaign } from '@/types/notifications';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

function describeAudience({ audience }: PushCampaign): string {
  if (audience.type === 'roles') {
    return AVAILABLE_ROLES.filter(r => audience.roles?.includes(r.value)).map(r => r.label).join(', ') || 'Por rol';
  }
  if (audience.type === 'users') {
    const count = audience.userIds?.length ?? 0;
    return `${count} ${count === 1 ? 'usuario' : 'usuarios'}`;
  }
  return AUDIENCE_OPTIONS.find(o => o.value === audience.type)?.label ?? audience.type;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm font-bold text-neutral-black-80">{value}</span>
      <span className="text-[11px] text-neutral-black-50">{label}</span>
    </div>
  );
}

export default function AdminNotificacionesPage() {
  const { campaigns, loading, error, refetch, sendCampaign } = useAdminPushCampaigns();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-baseline gap-2 mb-5">
        <h1 className="text-lg font-bold text-neutral-black-80">Notificaciones push</h1>
        <span className="text-xs text-neutral-black-40">Promociones al celular</span>
      </div>

      <section className="rounded-2xl border border-neutral-black-20 bg-white p-4 mb-8">
        <PushCampaignForm onSend={sendCampaign} />
      </section>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-neutral-black-80">Enviadas</h2>
        <button
          onClick={refetch}
          aria-label="Recargar"
          className="p-1.5 rounded-full text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10 transition-colors"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-black-50">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm">Cargando notificaciones...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-red-500">{error}</p>
          <Button variant="outline" size="sm" onClick={refetch} leftIcon={<RefreshCw size={14} />}>
            Reintentar
          </Button>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-black-50">
          <BellRing size={32} className="opacity-40" />
          <p className="text-sm">Todavía no has enviado notificaciones</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {campaigns.map(c => {
            const sending = c.status === 'sending';
            const ctr = c.stats.sent > 0 ? `${((c.stats.clicks / c.stats.sent) * 100).toFixed(1)}%` : '—';
            return (
              <li key={c.id} className="rounded-2xl border border-neutral-black-20 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                      sending ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    )}
                  >
                    {sending ? 'Enviando…' : 'Enviada'}
                  </span>
                  <span className="text-[11px] text-neutral-black-50">
                    {formatDate(c.createdAt)} · {describeAudience(c)}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-neutral-black-80 truncate">{c.title}</h3>
                <p className="text-xs text-neutral-black-50 mt-0.5 line-clamp-2">{c.body}</p>
                <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t border-neutral-black-10">
                  <Stat label="Usuarios" value={c.stats.targetUsers} />
                  <Stat label="Dispositivos" value={sending ? '…' : c.stats.sent} />
                  <Stat label="Fallidas" value={sending ? '…' : c.stats.failed} />
                  <Stat label="Clics" value={c.stats.clicks} />
                  <Stat label="CTR" value={sending ? '…' : ctr} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
