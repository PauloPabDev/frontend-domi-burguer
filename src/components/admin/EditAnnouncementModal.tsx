"use client";

import { useState } from 'react';
import { X, Megaphone, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';
import { AnnouncementModal } from '@/components/announcements/AnnouncementModal';
import { showAnnouncementToast } from '@/components/announcements/showAnnouncementToast';
import {
  AdminAnnouncement,
  AnnouncementAudience,
  AnnouncementDisplay,
  AnnouncementInput,
  AnnouncementStatus,
  AnnouncementVariant,
} from '@/types/announcements';
import { cn } from '@/lib/utils';

const FIELD_CLASS = "w-full px-3 py-2 text-sm rounded-xl border border-neutral-black-20 focus:outline-none focus:border-primary-red transition-colors bg-white";
const LABEL_CLASS = "block text-xs font-semibold text-neutral-black-50 mb-1";
const HINT_CLASS = "text-[11px] text-neutral-black-40 mt-1";

const DISPLAY_OPTIONS: { value: AnnouncementDisplay; label: string }[] = [
  { value: 'modal', label: 'Modal' },
  { value: 'toast', label: 'Toast' },
];
const VARIANT_OPTIONS: { value: AnnouncementVariant; label: string }[] = [
  { value: 'info', label: 'Aviso' },
  { value: 'promo', label: 'Promoción' },
  { value: 'warning', label: 'Importante' },
];
const AUDIENCE_OPTIONS: { value: AnnouncementAudience; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'anonymous', label: 'Sin sesión' },
  { value: 'logged_in', label: 'Con sesión' },
];
const STATUS_OPTIONS: { value: AnnouncementStatus; label: string }[] = [
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Activo' },
  { value: 'archived', label: 'Archivado' },
];

// <input type="datetime-local"> trabaja en hora local, sin zona: se convierte desde y hacia ISO
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

interface Segmented<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

function SegmentedControl<T extends string>({ value, options, onChange }: Segmented<T>) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium transition-colors',
            value === option.value
              ? 'bg-primary-red text-white'
              : 'bg-neutral-black-10 text-neutral-black-50 hover:bg-neutral-black-20 hover:text-neutral-black-80'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface EditAnnouncementModalProps {
  /** Aviso a editar. Sin él se crea uno nuevo. */
  announcement?: AdminAnnouncement;
  /** Datos con los que arranca el formulario al crear (ej. al duplicar). */
  template?: AdminAnnouncement;
  onSave: (id: string | null, data: AnnouncementInput) => Promise<unknown>;
  onClose: () => void;
}

export const EditAnnouncementModal: React.FC<EditAnnouncementModalProps> = ({
  announcement,
  template,
  onSave,
  onClose,
}) => {
  const isCreating = !announcement;
  const source = announcement ?? template;

  const [form, setForm] = useState({
    title: source?.title ?? '',
    body: source?.body ?? '',
    imageUrl: source?.imageUrl ?? '',
    ctaLabel: source?.cta?.label ?? '',
    ctaHref: source?.cta?.href ?? '',
    display: (source?.display ?? 'modal') as AnnouncementDisplay,
    variant: (source?.variant ?? 'info') as AnnouncementVariant,
    audience: (source?.audience ?? 'all') as AnnouncementAudience,
    priority: source?.priority ?? 0,
    dismissible: source?.dismissible ?? true,
    routes: (source?.routes ?? []).join('\n'),
    // duplicar siempre arranca como borrador
    status: (announcement ? announcement.status : 'draft') as AnnouncementStatus,
    startsAt: toLocalInput(source?.startsAt),
    endsAt: toLocalInput(source?.endsAt),
    republish: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const cta = form.ctaLabel.trim() && form.ctaHref.trim()
    ? { label: form.ctaLabel.trim(), href: form.ctaHref.trim() }
    : null;

  // Lo que se ve en la vista previa: el borrador tal como está en el formulario
  const draft = {
    variant: form.variant,
    title: form.title.trim() || 'Título del aviso',
    body: form.body,
    imageUrl: form.imageUrl.trim() || null,
    cta,
    dismissible: form.dismissible,
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('El título es requerido'); return; }
    if (!!form.ctaLabel.trim() !== !!form.ctaHref.trim()) {
      setError('El botón necesita texto y enlace (o deja los dos vacíos)');
      return;
    }
    if (cta && !/^(\/|https?:\/\/)/.test(cta.href)) {
      setError('El enlace debe empezar con "/" (dentro de la app) o con http(s)://');
      return;
    }
    const routes = form.routes
      .split(/[\n,]/)
      .map(route => route.trim())
      .filter(Boolean);
    if (routes.some(route => !route.startsWith('/'))) {
      setError('Las rutas deben empezar con "/" (ej. /cart)');
      return;
    }
    const startsAt = fromLocalInput(form.startsAt);
    const endsAt = fromLocalInput(form.endsAt);
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
      setError('La fecha de fin debe ser posterior a la de inicio');
      return;
    }

    setLoading(true);
    setError(null);

    const payload: AnnouncementInput = {
      title: form.title.trim(),
      body: form.body,
      imageUrl: form.imageUrl.trim() || null,
      cta,
      display: form.display,
      variant: form.variant,
      audience: form.audience,
      priority: form.priority,
      dismissible: form.dismissible,
      routes,
      status: form.status,
      startsAt,
      endsAt,
      ...(!isCreating && form.republish ? { republish: true } : {}),
    };

    try {
      await onSave(announcement?.id ?? null, payload);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-black-10 shrink-0">
          <div className="flex items-center gap-2">
            <Megaphone size={16} className="text-primary-red" />
            <h3 className="font-bold text-sm text-neutral-black-80">
              {isCreating ? 'Nuevo aviso' : 'Editar aviso'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-black-50 hover:text-neutral-black-80" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className={LABEL_CLASS}>Título</label>
            <input
              type="text"
              value={form.title}
              maxLength={120}
              onChange={e => set('title', e.target.value)}
              className={FIELD_CLASS}
              placeholder="¡2x1 en hamburguesas este viernes!"
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Texto (acepta markdown)</label>
            <textarea
              value={form.body}
              maxLength={3000}
              rows={5}
              onChange={e => set('body', e.target.value)}
              className={`${FIELD_CLASS} resize-y font-mono text-xs`}
              placeholder={'Escribe el aviso. Puedes usar **negrita**, listas con "-" y [enlaces](https://…)'}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Imagen (URL, opcional)</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={e => set('imageUrl', e.target.value)}
              className={FIELD_CLASS}
              placeholder="https://…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Botón: texto (opcional)</label>
              <input
                type="text"
                value={form.ctaLabel}
                maxLength={40}
                onChange={e => set('ctaLabel', e.target.value)}
                className={FIELD_CLASS}
                placeholder="Pedir ahora"
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Botón: enlace</label>
              <input
                type="text"
                value={form.ctaHref}
                onChange={e => set('ctaHref', e.target.value)}
                className={FIELD_CLASS}
                placeholder="/#products"
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Cómo se muestra</label>
            <SegmentedControl value={form.display} options={DISPLAY_OPTIONS} onChange={v => set('display', v)} />
          </div>

          <div>
            <label className={LABEL_CLASS}>Estilo</label>
            <SegmentedControl value={form.variant} options={VARIANT_OPTIONS} onChange={v => set('variant', v)} />
          </div>

          <div>
            <label className={LABEL_CLASS}>Audiencia</label>
            <SegmentedControl value={form.audience} options={AUDIENCE_OPTIONS} onChange={v => set('audience', v)} />
          </div>

          <div>
            <label className={LABEL_CLASS}>Estado</label>
            <SegmentedControl value={form.status} options={STATUS_OPTIONS} onChange={v => set('status', v)} />
            <p className={HINT_CLASS}>Solo los avisos &quot;Activo&quot; se muestran, dentro de su rango de fechas.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Inicia (opcional)</label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={e => set('startsAt', e.target.value)}
                className={FIELD_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Termina (opcional)</label>
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={e => set('endsAt', e.target.value)}
                className={FIELD_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Prioridad</label>
              <input
                type="number"
                min={0}
                max={1000}
                value={form.priority}
                onChange={e => set('priority', Math.max(0, Math.round(Number(e.target.value) || 0)))}
                className={FIELD_CLASS}
              />
              <p className={HINT_CLASS}>Mayor número = sale primero.</p>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                id="announcement-dismissible"
                type="checkbox"
                checked={form.dismissible}
                onChange={e => set('dismissible', e.target.checked)}
                className="w-4 h-4 accent-primary-red"
              />
              <label htmlFor="announcement-dismissible" className="text-sm text-neutral-black-80">
                Se puede cerrar
              </label>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Páginas donde sale (opcional)</label>
            <textarea
              value={form.routes}
              rows={2}
              onChange={e => set('routes', e.target.value)}
              className={`${FIELD_CLASS} resize-y font-mono text-xs`}
              placeholder={'/\n/cart'}
            />
            <p className={HINT_CLASS}>Una por línea. Vacío = todas las páginas públicas.</p>
          </div>

          {!isCreating && (
            <label className="flex items-start gap-2 rounded-xl bg-accent-yellow-10 px-3 py-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.republish}
                onChange={e => set('republish', e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-primary-red"
              />
              <span className="text-sm text-neutral-black-80">
                <span className="font-semibold">Volver a mostrar</span> a quienes ya lo vieron
                <span className="block text-[11px] text-neutral-black-50">
                  Hoy está en la versión {announcement.version}; subirá a la {announcement.version + 1}.
                </span>
              </span>
            </label>
          )}

          {/* Vista previa */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-black-50 flex items-center gap-1.5">
                <Eye size={13} /> Vista previa
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="light-outline" size="sm" onClick={() => setPreviewModal(true)}>
                  Probar modal
                </Button>
                <Button type="button" variant="light-outline" size="sm" onClick={() => showAnnouncementToast(draft)}>
                  Probar toast
                </Button>
              </div>
            </div>
            <AnnouncementCard announcement={draft} />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-2 justify-end px-5 py-4 border-t border-neutral-black-10 shrink-0">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={loading}>
            {isCreating ? 'Crear aviso' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      {previewModal && (
        <AnnouncementModal
          announcement={draft}
          open
          onClose={() => setPreviewModal(false)}
          onCta={() => setPreviewModal(false)}
        />
      )}
    </div>
  );
};
