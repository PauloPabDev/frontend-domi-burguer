"use client";

import { useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, MessageSquareQuote, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MapComponent } from '@/components/map/map';
import { NOTE_KINDS, formatNoteDate } from '@/components/notes/noteKinds';
import { useNotes } from '@/hooks/notes/useNotes';
import type { Note } from '@/types/notes';
import type { Location } from '@/types/locations';
import { LocationDetailModal, PROPERTY_TYPE_LABELS } from '../LocationCard';

export interface LocationUsage {
  count: number;
  /** ISO del pedido más reciente a esta dirección */
  last: string | null;
}

export interface LocationDeliveryStatus {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  /** "3,2 km · ~12 min" cuando el domicilio ya se calculó */
  summary: string | null;
}

interface LocationOptionProps {
  location: Location;
  selected: boolean;
  usage: LocationUsage;
  mostUsed: boolean;
  onSelect: (id: string) => void;
  onDeleted: (id: string) => void;
  /** Solo se pasa a la dirección elegida: mapa + estado del domicilio. */
  delivery?: LocationDeliveryStatus;
  /** Contenido extra bajo la dirección elegida (editor del precio en móvil). */
  children?: ReactNode;
}

const isAlert = (n: Note) => n.kind === 'warning' || n.kind === 'access';

/** La fijada manda; si no hay, una de "Cuidado"/"Acceso" antes que cualquier otra. */
const pickNote = (notes: Note[]) => (notes[0]?.pinned ? notes[0] : notes.find(isAlert) ?? notes[0]);

export function LocationOption({ location, selected, usage, mostUsed, onSelect, onDeleted, delivery, children }: LocationOptionProps) {
  const [showDetail, setShowDetail] = useState(false);
  const { notes, refetch } = useNotes('location', location.id);
  const note = pickNote(notes);
  const kind = note ? NOTE_KINDS[note.kind] ?? NOTE_KINDS.other : null;
  const KindIcon = kind?.icon;

  return (
    <div className={cn('rounded-xl border-[1.5px] bg-white', selected ? 'border-green-700 bg-green-50 ring-1 ring-inset ring-green-700' : 'border-neutral-black-20 hover:border-neutral-black-50')}>
      <div
        role="radio"
        aria-checked={selected}
        tabIndex={0}
        onClick={() => onSelect(location.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(location.id);
          }
        }}
        className="grid min-h-11 cursor-pointer grid-cols-[auto_1fr] gap-3 rounded-xl p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red/50"
      >
        <span aria-hidden="true" className={cn('mt-0.5 flex size-5 items-center justify-center rounded-full border-2', selected ? 'border-green-700' : 'border-neutral-black-20')}>
          {selected && <span className="size-2.5 rounded-full bg-green-700" />}
        </span>

        <div className="grid min-w-0 gap-1.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <b className="text-sm text-neutral-black-80">{location.name}</b>
            {mostUsed ? (
              <span className="rounded-full bg-accent-yellow-60 px-2.5 py-0.5 text-xs font-semibold text-neutral-black-80">
                Más usada · {usage.count} pedidos
              </span>
            ) : usage.count > 0 ? (
              <span className="rounded-full bg-neutral-black-10 px-2.5 py-0.5 text-xs font-semibold text-neutral-black-80/70">
                {usage.count} {usage.count === 1 ? 'pedido' : 'pedidos'}
              </span>
            ) : null}
          </div>

          <p className="break-words text-sm text-neutral-black-80">
            {location.address}
            {location.floor && ` · ${location.floor}`}
          </p>

          {location.comment && (
            <p className="flex items-start gap-1.5 rounded-lg border border-accent-yellow-100 bg-accent-yellow-20 px-2 py-1.5 text-sm text-neutral-black-80">
              <MessageSquareQuote className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span><span className="sr-only">Comentario de la dirección: </span>{location.comment}</span>
            </p>
          )}

          {note && kind && KindIcon && (
            <p className={cn('flex items-start gap-1.5 rounded-lg border px-2 py-1.5 text-sm text-neutral-black-80', isAlert(note) ? kind.chip : 'border-dashed border-neutral-black-20 bg-white')}>
              {note.pinned ? <Pin className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <KindIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
              <span>
                <b>{kind.label}: </b>{note.text}
                <span className="text-neutral-black-80/70"> — {note.authorName}</span>
                {notes.length > 1 && <b className="ml-1.5 text-neutral-black-80/70">+{notes.length - 1} {notes.length === 2 ? 'nota' : 'notas'}</b>}
              </span>
            </p>
          )}

          <p className="flex flex-wrap gap-x-3 text-xs text-neutral-black-80/70">
            <span>{PROPERTY_TYPE_LABELS[location.propertyType] ?? location.propertyType}</span>
            {usage.last && <span>Último uso: {formatNoteDate(usage.last)}</span>}
          </p>
        </div>
      </div>

      <div className="px-3 pb-3 pl-11">
        <Button type="button" variant="link" className="h-11 text-sm text-primary-red-100" onClick={() => setShowDetail(true)}>
          Ver detalle y notas
        </Button>
      </div>

      {selected && delivery && (
        <div className="grid gap-3 px-3 pb-3">
          <div className="h-24 overflow-hidden rounded-lg">
            <MapComponent
              coordinates={location.coordinates}
              minHeight="96px"
              showZoomControl={false}
              showStreetView={false}
              showMapType={false}
              showFullscreen={false}
            />
          </div>

          <div aria-live="polite" className="text-sm">
            {delivery.loading ? (
              <p className="flex items-center gap-2 text-neutral-black-80/70">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Calculando el domicilio…
              </p>
            ) : delivery.error ? (
              <div className="flex flex-wrap items-center gap-2">
                <p className="flex items-center gap-1.5 font-medium text-primary-red-100">
                  <AlertTriangle className="size-4" aria-hidden="true" />
                  {delivery.error}
                </p>
                <Button type="button" variant="light-outline" className="h-11" onClick={delivery.onRetry}>Reintentar</Button>
              </div>
            ) : delivery.summary ? (
              <p className="flex items-center gap-1.5 font-medium text-green-800">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Domicilio calculado · {delivery.summary}
              </p>
            ) : null}
          </div>
          {children}
        </div>
      )}

      {showDetail && (
        <LocationDetailModal
          location={location}
          onClose={() => { setShowDetail(false); refetch(); }}
          onDeleted={onDeleted}
        />
      )}
    </div>
  );
}
