"use client";

import { useState } from 'react';
import { Loader2, RefreshCw, Megaphone, Plus, Pencil, Copy, Archive } from 'lucide-react';
import { useAdminAnnouncements } from '@/hooks/admin/useAdminAnnouncements';
import { EditAnnouncementModal } from '@/components/admin/EditAnnouncementModal';
import { ConfirmModal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { notify } from '@/utils/notify';
import { AdminAnnouncement } from '@/types/announcements';

type Lifecycle = 'live' | 'scheduled' | 'expired' | 'draft' | 'archived';

// El estado guardado no basta: un aviso "activo" puede estar programado a futuro o ya vencido
function getLifecycle(a: AdminAnnouncement, now = new Date()): Lifecycle {
  if (a.status === 'archived') return 'archived';
  if (a.status === 'draft') return 'draft';
  if (a.startsAt && new Date(a.startsAt) > now) return 'scheduled';
  if (a.endsAt && new Date(a.endsAt) <= now) return 'expired';
  return 'live';
}

const LIFECYCLE_LABELS: Record<Lifecycle, { label: string; className: string }> = {
  live: { label: 'Activo', className: 'bg-green-100 text-green-700' },
  scheduled: { label: 'Programado', className: 'bg-blue-100 text-blue-700' },
  expired: { label: 'Vencido', className: 'bg-neutral-black-10 text-neutral-black-50' },
  draft: { label: 'Borrador', className: 'bg-accent-yellow-40 text-neutral-black-80' },
  archived: { label: 'Archivado', className: 'bg-neutral-black-10 text-neutral-black-40' },
};

const FILTERS: { value: Lifecycle | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'live', label: 'Activos' },
  { value: 'scheduled', label: 'Programados' },
  { value: 'draft', label: 'Borradores' },
  { value: 'expired', label: 'Vencidos' },
  { value: 'archived', label: 'Archivados' },
];

const AUDIENCE_LABELS = { all: 'Todos', anonymous: 'Sin sesión', logged_in: 'Con sesión' } as const;

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatRange(a: AdminAnnouncement): string {
  if (!a.startsAt && !a.endsAt) return 'Sin fechas';
  if (a.startsAt && a.endsAt) return `${formatDate(a.startsAt)} → ${formatDate(a.endsAt)}`;
  return a.startsAt ? `Desde ${formatDate(a.startsAt)}` : `Hasta ${formatDate(a.endsAt)}`;
}

// editing: aviso a editar · template: datos para uno nuevo (duplicar) · ambos vacíos: crear desde cero
type ModalState = { editing?: AdminAnnouncement; template?: AdminAnnouncement } | null;

export default function AdminAvisosPage() {
  const {
    announcements, loading, error,
    refetch, createAnnouncement, updateAnnouncement, archiveAnnouncement,
  } = useAdminAnnouncements();

  const [filter, setFilter] = useState<Lifecycle | ''>('');
  const [modalState, setModalState] = useState<ModalState>(null);
  const [toArchive, setToArchive] = useState<AdminAnnouncement | null>(null);

  const now = new Date();
  const visible = announcements
    .map(a => ({ a, lifecycle: getLifecycle(a, now) }))
    // los archivados solo salen si se piden: no estorban en la vista general
    .filter(({ lifecycle }) => (filter ? lifecycle === filter : lifecycle !== 'archived'));

  const handleSave = async (id: string | null, data: Parameters<typeof createAnnouncement>[0]) => {
    if (id) {
      await updateAnnouncement(id, data);
    } else {
      await createAnnouncement(data);
    }
  };

  const handleArchive = async () => {
    if (!toArchive) return;
    try {
      await archiveAnnouncement(toArchive.id);
      notify.success('Aviso archivado');
    } catch (e) {
      notify.error('No se pudo archivar', e instanceof Error ? e.message : undefined);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-baseline gap-2">
          <h1 className="text-lg font-bold text-neutral-black-80">Avisos</h1>
          {announcements.length > 0 && !loading && (
            <span className="text-xs text-neutral-black-40">{announcements.length} total</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            aria-label="Recargar"
            className="p-1.5 rounded-full text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10 transition-colors"
          >
            <RefreshCw size={15} />
          </button>
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setModalState({})}>
            Nuevo aviso
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              filter === value
                ? 'bg-primary-red text-white'
                : 'bg-neutral-black-10 text-neutral-black-50 hover:bg-neutral-black-20 hover:text-neutral-black-80'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-black-50">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm">Cargando avisos...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-red-500">{error}</p>
          <Button variant="outline" size="sm" onClick={refetch} leftIcon={<RefreshCw size={14} />}>
            Reintentar
          </Button>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-black-50">
          <Megaphone size={32} className="opacity-40" />
          <p className="text-sm">No hay avisos{filter ? ' en este filtro' : ' todavía'}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map(({ a, lifecycle }) => {
            const badge = LIFECYCLE_LABELS[lifecycle];
            return (
              <li key={a.id} className="rounded-2xl border border-neutral-black-20 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold', badge.className)}>
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-neutral-black-50">
                        {a.display === 'modal' ? 'Modal' : 'Toast'} · {AUDIENCE_LABELS[a.audience]} · prioridad {a.priority} · v{a.version}
                      </span>
                    </div>
                    <h2 className="font-bold text-sm text-neutral-black-80 truncate">{a.title}</h2>
                    <p className="text-xs text-neutral-black-50 mt-0.5">{formatRange(a)}</p>
                    {a.routes.length > 0 && (
                      <p className="text-xs text-neutral-black-40 mt-0.5 truncate">Solo en: {a.routes.join(', ')}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setModalState({ editing: a })}
                      aria-label="Editar"
                      title="Editar"
                      className="p-2 rounded-full text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setModalState({ template: a })}
                      aria-label="Duplicar"
                      title="Duplicar"
                      className="p-2 rounded-full text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10 transition-colors"
                    >
                      <Copy size={15} />
                    </button>
                    {a.status !== 'archived' && (
                      <button
                        onClick={() => setToArchive(a)}
                        aria-label="Archivar"
                        title="Archivar"
                        className="p-2 rounded-full text-neutral-black-50 hover:text-primary-red hover:bg-primary-red/10 transition-colors"
                      >
                        <Archive size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {modalState && (
        <EditAnnouncementModal
          announcement={modalState.editing}
          template={modalState.template}
          onSave={handleSave}
          onClose={() => setModalState(null)}
        />
      )}

      {toArchive && (
        <ConfirmModal
          open
          onOpenChange={(open) => { if (!open) setToArchive(null); }}
          title="Archivar aviso"
          message={`"${toArchive.title}" dejará de mostrarse a los usuarios.`}
          confirmText="ARCHIVAR"
          destructive
          onConfirm={handleArchive}
        />
      )}
    </div>
  );
}
