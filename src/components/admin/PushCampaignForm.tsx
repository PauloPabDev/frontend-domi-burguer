"use client";

import { useState } from 'react';
import { Plus, Send, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminService } from '@/services/adminService';
import { UserService } from '@/services/userService';
import { AVAILABLE_ROLES } from '@/components/admin/EditRolesModal';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { notify } from '@/utils/notify';
import { CampaignAudienceType, PushCampaignInput } from '@/types/notifications';

const FIELD_CLASS = "w-full px-3 py-2 text-sm rounded-xl border border-neutral-black-20 focus:outline-none focus:border-primary-red transition-colors bg-white";
const LABEL_CLASS = "block text-xs font-semibold text-neutral-black-50 mb-1";
const HINT_CLASS = "text-[11px] text-neutral-black-40 mt-1";

// Mismos límites que createCampaignSchema del backend
const TITLE_MAX = 60;
const BODY_MAX = 180;

export const AUDIENCE_OPTIONS: { value: CampaignAudienceType; label: string; hint: string }[] = [
  { value: 'all', label: 'Todos', hint: 'Todos los usuarios con notificaciones activas' },
  { value: 'clients', label: 'Solo clientes', hint: 'Sin cocina, recepción, domiciliarios ni admin' },
  { value: 'roles', label: 'Por rol', hint: 'Solo el personal con los roles elegidos' },
  { value: 'users', label: 'Usuarios específicos', hint: 'Búscalos por correo o teléfono (sirve para enviarte una prueba)' },
];

interface PickedUser { id: string; label: string }

// Los teléfonos se guardan como +57XXXXXXXXXX; se acepta que el admin escriba solo los 10 dígitos
function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length === 10 ? `+57${digits}` : `+${digits}`;
}

function validate(form: PushCampaignInput, users: PickedUser[]): string | null {
  if (!form.title.trim() || !form.body.trim()) return 'El título y el mensaje son obligatorios';
  if (!/^\/(?!\/)/.test(form.url)) return 'El enlace debe ser una ruta del sitio, por ejemplo / o /#producto';
  if (form.imageUrl && !form.imageUrl.startsWith('https://')) return 'La imagen debe ser una URL https://';
  if (form.audience.type === 'roles' && !form.audience.roles?.length) return 'Elige al menos un rol';
  if (form.audience.type === 'users' && users.length === 0) return 'Agrega al menos un usuario';
  return null;
}

/** Cómo se verá en Android: badge monocromático, título, mensaje, ícono e imagen grande */
function NotificationPreview({ title, body, imageUrl }: { title: string; body: string; imageUrl: string }) {
  return (
    <div className="rounded-2xl bg-[#202124] p-3 text-white shadow-sm">
      <div className="flex items-center gap-1.5 text-[11px] text-white/60 mb-1.5">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-red">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/badge-96x96.png" alt="" className="h-3 w-3" />
        </span>
        Domi Burguer · ahora
      </div>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold break-words">{title || 'Título de la notificación'}</p>
          <p className="text-[13px] text-white/80 whitespace-pre-line break-words">{body || 'Mensaje de la notificación'}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192x192.png" alt="" className="h-10 w-10 rounded-full shrink-0" />
      </div>
      {imageUrl.startsWith('https://') && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="mt-2 w-full max-h-48 object-cover rounded-xl" />
      )}
      <p className="mt-2 text-xs font-semibold text-[#8ab4f8]">No recibir promociones</p>
    </div>
  );
}

interface PushCampaignFormProps {
  onSend: (data: PushCampaignInput) => Promise<unknown>;
}

export function PushCampaignForm({ onSend }: PushCampaignFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/');
  const [imageUrl, setImageUrl] = useState('');
  const [audienceType, setAudienceType] = useState<CampaignAudienceType>('clients');
  const [roles, setRoles] = useState<string[]>([]);
  const [users, setUsers] = useState<PickedUser[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);

  const form: PushCampaignInput = {
    title,
    body,
    url: url.trim() || '/',
    imageUrl: imageUrl.trim(),
    audience: {
      type: audienceType,
      ...(audienceType === 'roles' && { roles }),
      ...(audienceType === 'users' && { userIds: users.map(u => u.id) }),
    },
  };
  const audienceLabel = audienceType === 'users'
    ? `${users.length} ${users.length === 1 ? 'usuario' : 'usuarios'}`
    : audienceType === 'roles'
      ? AVAILABLE_ROLES.filter(r => roles.includes(r.value)).map(r => r.label).join(', ')
      : AUDIENCE_OPTIONS.find(o => o.value === audienceType)?.label;

  const toggleRole = (role: string) =>
    setRoles(prev => (prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]));

  const addUser = async () => {
    const query = userQuery.trim();
    if (!user || !query) return;
    setSearching(true);
    try {
      const token = await user.getIdToken();
      const found = query.includes('@')
        ? (await AdminService.getUsers(token, 1, 1, 'email', query.toLowerCase(), '==')).body?.[0]
        : (await UserService.findByPhone(normalizePhone(query), token)).body;
      if (!found) throw new Error('Usuario no encontrado');
      if (!users.some(u => u.id === found.id)) {
        setUsers(prev => [...prev, { id: found.id, label: found.name || found.email || found.phone || found.id }]);
      }
      setUserQuery('');
    } catch {
      notify.error('Usuario no encontrado', `No hay ningún usuario con «${query}»`);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validate(form, users);
    if (problem) {
      notify.error('Revisa la notificación', problem);
      return;
    }
    setConfirming(true);
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await onSend(form);
      notify.success('Notificación en envío', 'Los totales aparecen en el historial cuando termine');
      setTitle('');
      setBody('');
      setImageUrl('');
    } catch (e) {
      notify.error('No se pudo enviar', e instanceof Error ? e.message : undefined);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4 min-w-0">
          <div>
            <label className={LABEL_CLASS} htmlFor="campaign-title">Título</label>
            <input
              id="campaign-title"
              className={FIELD_CLASS}
              value={title}
              maxLength={TITLE_MAX}
              onChange={e => setTitle(e.target.value)}
              placeholder="¡2x1 en hamburguesas hoy! 🍔"
            />
            <p className={HINT_CLASS}>{title.length}/{TITLE_MAX}</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="campaign-body">Mensaje</label>
            <textarea
              id="campaign-body"
              className={cn(FIELD_CLASS, 'min-h-[80px] resize-y')}
              value={body}
              maxLength={BODY_MAX}
              onChange={e => setBody(e.target.value)}
              placeholder="Solo hasta las 10 p. m. Pide ya desde la app."
            />
            <p className={HINT_CLASS}>{body.length}/{BODY_MAX}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="campaign-url">Enlace al tocarla</label>
              <input id="campaign-url" className={FIELD_CLASS} value={url} onChange={e => setUrl(e.target.value)} />
              <p className={HINT_CLASS}>Ruta del sitio: / o un producto como /#domi-clasica</p>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="campaign-image">Imagen (URL https, opcional)</label>
              <input
                id="campaign-image"
                className={FIELD_CLASS}
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://…"
              />
              <p className={HINT_CLASS}>Se ve grande en Android y en Chrome de escritorio</p>
            </div>
          </div>

          <fieldset>
            <legend className={LABEL_CLASS}>¿A quién?</legend>
            <div className="flex flex-wrap gap-1.5">
              {AUDIENCE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAudienceType(value)}
                  aria-pressed={audienceType === value}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                    audienceType === value
                      ? 'bg-primary-red text-white'
                      : 'bg-neutral-black-10 text-neutral-black-50 hover:bg-neutral-black-20 hover:text-neutral-black-80'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className={HINT_CLASS}>{AUDIENCE_OPTIONS.find(o => o.value === audienceType)?.hint}</p>

            {audienceType === 'roles' && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {AVAILABLE_ROLES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleRole(value)}
                    aria-pressed={roles.includes(value)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                      roles.includes(value)
                        ? 'border-primary-red bg-primary-red/10 text-primary-red'
                        : 'border-neutral-black-20 text-neutral-black-50 hover:text-neutral-black-80'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {audienceType === 'users' && (
              <div className="mt-2 flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    className={FIELD_CLASS}
                    value={userQuery}
                    onChange={e => setUserQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addUser(); } }}
                    placeholder="correo@ejemplo.com o 3001234567"
                    aria-label="Buscar usuario por correo o teléfono"
                  />
                  <Button type="button" variant="outline" size="sm" loading={searching} leftIcon={<Plus size={14} />} onClick={addUser}>
                    Agregar
                  </Button>
                </div>
                {users.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5">
                    {users.map(u => (
                      <li key={u.id} className="flex items-center gap-1 rounded-full bg-neutral-black-10 pl-3 pr-1 py-0.5 text-xs text-neutral-black-80">
                        {u.label}
                        <button
                          type="button"
                          onClick={() => setUsers(prev => prev.filter(p => p.id !== u.id))}
                          aria-label={`Quitar a ${u.label}`}
                          className="p-1 rounded-full hover:bg-neutral-black-20"
                        >
                          <X size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </fieldset>

          <div>
            <Button type="submit" variant="primary" size="md" leftIcon={<Send size={14} />} loading={sending}>
              Enviar notificación
            </Button>
            <p className={HINT_CLASS}>Va como promoción: quien las apagó en su perfil no la recibe.</p>
          </div>
        </div>

        <div>
          <p className={LABEL_CLASS}>Vista previa</p>
          <NotificationPreview title={title} body={body} imageUrl={imageUrl.trim()} />
        </div>
      </form>

      {confirming && (
        <ConfirmModal
          open
          onOpenChange={(open) => { if (!open) setConfirming(false); }}
          title="Enviar notificación"
          message={`"${title.trim()}" se enviará ahora a: ${audienceLabel}. No se puede deshacer.`}
          confirmText="ENVIAR"
          loading={sending}
          onConfirm={handleSend}
        />
      )}
    </>
  );
}
