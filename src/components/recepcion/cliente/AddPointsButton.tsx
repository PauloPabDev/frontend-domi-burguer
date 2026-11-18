"use client";

import { useState } from 'react';
import { ShieldAlert, Star } from 'lucide-react';
import { FormModal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { PointsService } from '@/services/pointsService';
import { POINT_TYPES, PointType, RECEPTION_DAILY_POINTS_LIMIT } from '@/types/points';
import { cn } from '@/lib/utils';
import { notify } from '@/utils/notify';

const MAX_DESCRIPTION = 255; // límite de la API
const MIN_DESCRIPTION = 3;

const TYPE_OPTIONS: { value: PointType; label: string; hint: string }[] = [
  { value: POINT_TYPES.GIFT, label: 'Regalo', hint: 'Cortesía o compensación para el cliente' },
  { value: POINT_TYPES.CORRECTION, label: 'Corrección', hint: 'Ajuste por un error en sus puntos' },
];

interface AddPointsButtonProps {
  userId: string;
  userName?: string;
  /** Puntos manuales que ya se le dieron hoy a este usuario (cuentan para el tope de recepción) */
  givenToday: number;
  /** Se llama con los puntos sumados para que quien lo usa actualice el saldo mostrado */
  onAdded: (points: number) => void;
}

/** Botón + formulario para asignar puntos con un comentario. Solo recepción y admin (la API lo exige). */
export function AddPointsButton({ userId, userName, givenToday, onAdded }: AddPointsButtonProps) {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const { requestPointsGrant } = useSocket();
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<PointType>(POINT_TYPES.GIFT);
  const [saving, setSaving] = useState(false);

  const amount = Number(points);
  // recepción solo puede dar hasta el tope diario por cliente; lo demás lo aprueba un admin
  const isAdmin = userProfile?.roles?.includes('admin') ?? false;
  const remaining = Math.max(0, RECEPTION_DAILY_POINTS_LIMIT - givenToday);
  const needsApproval = !isAdmin && amount > remaining;
  // al admin nada lo frena, pero se le recuerda que ya se le dieron puntos de sobra a este cliente hoy
  const adminOverLimit = isAdmin && givenToday + amount > RECEPTION_DAILY_POINTS_LIMIT;
  const valid = Number.isInteger(amount) && amount >= 1 && description.trim().length >= MIN_DESCRIPTION;

  const handleOpenChange = (next: boolean) => {
    if (saving) return;
    setOpen(next);
    if (!next) {
      setPoints('');
      setDescription('');
      setType(POINT_TYPES.GIFT);
    }
  };

  const handleSubmit = async () => {
    if (!valid || saving || !user) return;
    setSaving(true);
    try {
      if (needsApproval) {
        const { adminsOnline } = await requestPointsGrant({ userId, points: amount, type, reason: description.trim() });
        if (adminsOnline > 0) notify.success('Solicitud enviada', 'Un administrador la revisará en un momento.');
        else notify.info('Solicitud en espera', 'No hay administradores conectados; la verán apenas entren.');
      } else {
        const token = await user.getIdToken();
        await PointsService.addPoints({ userId, points: amount, description: description.trim(), type }, token);
        notify.success('Puntos asignados', `${amount} pts para ${userName || 'el usuario'}.`);
        onAdded(amount);
      }
      handleOpenChange(false);
    } catch (e) {
      notify.error(needsApproval ? 'No se pudo enviar la solicitud' : 'No se pudieron asignar', e instanceof Error ? e.message : 'Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Star size={14} />
        Asignar puntos
      </Button>

      <FormModal
        open={open}
        onOpenChange={handleOpenChange}
        title="Asignar puntos"
        description={userName ? `Se suman al saldo de ${userName}.` : 'Se suman al saldo del usuario.'}
        submitText={needsApproval ? 'PEDIR APROBACIÓN' : adminOverLimit ? 'SÍ, ASIGNAR IGUAL' : 'ASIGNAR'}
        loading={saving}
        submitDisabled={!valid}
        mobileBottomSheet
        onSubmit={handleSubmit}
      >
        <div>
          <p className="text-xs font-semibold text-neutral-black-50 mb-1.5">Motivo</p>
          <div className="grid grid-cols-2 gap-2">
            {TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                title={option.hint}
                onClick={() => setType(option.value)}
                className={cn(
                  'rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                  type === option.value
                    ? 'border-primary-red bg-primary-red/5 text-primary-red'
                    : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-neutral-black-40 mt-1">
            {TYPE_OPTIONS.find((o) => o.value === type)?.hint}
          </p>
        </div>

        <div>
          <label htmlFor="add-points-amount" className="block text-xs font-semibold text-neutral-black-50 mb-1">
            Cantidad de puntos
          </label>
          <input
            id="add-points-amount"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="Ej: 10"
            className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-black-20 focus:outline-none focus:border-primary-red transition-colors bg-white"
          />
        </div>

        {adminOverLimit && (
          <div role="status" className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <ShieldAlert size={14} className="mt-0.5 shrink-0" />
            <p>
              ¿Estás seguro? Hoy ya se le dieron {givenToday} pts a este cliente (el tope diario de recepción es{' '}
              {RECEPTION_DAILY_POINTS_LIMIT}); con estos serían {givenToday + amount}. Puedes asignarlos igual, solo
              verifica que no sea un abuso de puntos.
            </p>
          </div>
        )}

        {needsApproval && (
          <div role="status" className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <ShieldAlert size={14} className="mt-0.5 shrink-0" />
            <p>
              Hoy ya le diste {givenToday} de {RECEPTION_DAILY_POINTS_LIMIT} pts a este cliente
              {remaining > 0 ? ` (te quedan ${remaining})` : ''}. Para dar {amount} pts se enviará una solicitud a un
              administrador y los puntos se suman cuando la apruebe.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="add-points-description" className="block text-xs font-semibold text-neutral-black-50 mb-1">
            Comentario
          </label>
          <textarea
            id="add-points-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={MAX_DESCRIPTION}
            rows={3}
            placeholder="Ej: Compensación por demora en el pedido del sábado."
            className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-black-20 focus:outline-none focus:border-primary-red transition-colors bg-white resize-none"
          />
          <p className="text-[11px] text-neutral-black-40 text-right">
            {description.length}/{MAX_DESCRIPTION}
          </p>
        </div>
      </FormModal>
    </>
  );
}
