"use client";

import { useState } from 'react';
import { ChevronDown, Loader2, Minus, Plus } from 'lucide-react';
import { usePointsHistory } from '@/hooks/usePointsHistory';
import { useUserProfile } from '@/hooks/useUserProfile';
import { POINT_FLOW_TYPES, POINT_TYPE_LABELS, Point, RECEPTION_DAILY_POINTS_LIMIT } from '@/types/points';
import { cn } from '@/lib/utils';
import { AddPointsButton } from './AddPointsButton';

const formatDateTime = (point: Point) =>
  new Date(point.createdAt._seconds * 1000).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

interface UserPointsPanelProps {
  userId: string;
  userName?: string;
  /** Se llama con los puntos sumados para que quien lo usa actualice el saldo mostrado */
  onAdded: (points: number) => void;
}

/** Asignar puntos + historial desplegable de un usuario. Para recepción y admin. */
export function UserPointsPanel({ userId, userName, onAdded }: UserPointsPanelProps) {
  const { userProfile } = useUserProfile();
  const isAdmin = userProfile?.roles?.includes('admin') ?? false;
  const { points, loading, error, refetch, givenToday } = usePointsHistory(userId);
  const [open, setOpen] = useState(false);

  const handleAdded = (added: number) => {
    onAdded(added);
    refetch();
  };

  return (
    <div className="rounded-xl border border-neutral-black-10">
      <div className="flex items-center justify-between gap-3 p-3">
        <p className="text-xs text-neutral-black-50">
          {isAdmin ? (
            'Sin tope diario (admin)'
          ) : (
            <>
              Hoy: <span className="font-semibold text-neutral-black-80">{givenToday}/{RECEPTION_DAILY_POINTS_LIMIT}</span> pts dados
            </>
          )}
        </p>
        <AddPointsButton userId={userId} userName={userName} givenToday={givenToday} onAdded={handleAdded} />
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-neutral-black-10 bg-neutral-black-5 hover:bg-neutral-black-10 rounded-b-xl text-xs text-neutral-black-60 transition-colors"
      >
        {open ? 'Ocultar historial de puntos' : 'Ver historial de puntos'}
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="max-h-64 overflow-y-auto divide-y divide-neutral-black-10 border-t border-neutral-black-10">
          {loading ? (
            <div className="flex justify-center py-4 text-neutral-black-40">
              <Loader2 size={16} className="animate-spin" />
            </div>
          ) : error ? (
            <p className="p-3 text-xs text-red-600 text-center">{error}</p>
          ) : points.length === 0 ? (
            <p className="p-3 text-xs text-neutral-black-50 text-center">Aún no hay movimientos de puntos</p>
          ) : (
            points.map((point) => {
              const isInput = point.flowType === POINT_FLOW_TYPES.INPUT;
              return (
                <div key={point.id} className="flex items-center gap-3 px-3 py-2">
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                      isInput ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}
                  >
                    {isInput ? <Plus size={12} /> : <Minus size={12} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-neutral-black-80 break-words">{point.description}</p>
                    <p className="text-[11px] text-neutral-black-40">
                      {POINT_TYPE_LABELS[point.type] ?? point.type} · {formatDateTime(point)}
                    </p>
                  </div>
                  <span className={cn('text-sm font-bold tabular-nums', isInput ? 'text-green-700' : 'text-red-700')}>
                    {isInput ? '+' : '−'}{point.points}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
