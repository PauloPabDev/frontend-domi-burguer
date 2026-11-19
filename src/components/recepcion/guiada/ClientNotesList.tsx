"use client";

import Link from 'next/link';
import { Camera, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Note } from '@/types/notes';
import { NOTE_KINDS, formatNoteDate, roleLabel } from '@/components/notes/noteKinds';

interface ClientNotesListProps {
  notes: Note[];
  loading: boolean;
  phone: string;
}

/** Notas del personal sobre el cliente, solo lectura. Fijadas primero; las "Cuidado" resaltadas en rojo. */
export function ClientNotesList({ notes, loading, phone }: ClientNotesListProps) {
  const sorted = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <section aria-labelledby="client-notes-title" className="rounded-xl border border-neutral-black-20 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 id="client-notes-title" className="font-bold text-neutral-black-80">Notas del personal</h3>
        <Link
          href={`/recepcion/cliente?phone=${encodeURIComponent(phone)}`}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-primary-red-100 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary-red-100"
        >
          Ver ficha
        </Link>
      </div>

      {loading ? (
        <p role="status" className="text-sm text-neutral-black-80/70">Cargando notas…</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-neutral-black-80/70">Sin notas del personal.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((n) => {
            const kind = NOTE_KINDS[n.kind];
            const Icon = kind.icon;
            const isWarning = n.kind === 'warning';
            const role = roleLabel(n.authorRole);
            return (
              <li
                key={n.id}
                className={cn(
                  'rounded-lg border p-3',
                  isWarning ? 'border-red-200 bg-red-50' : 'border-neutral-black-20 bg-neutral-black-3',
                )}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold', isWarning ? 'border-red-200 bg-white text-red-800' : kind.chip)}>
                    <Icon className="size-3.5" aria-hidden="true" />
                    {kind.label}
                  </span>
                  {n.pinned && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-black-80/70">
                      <Pin className="size-3.5" aria-hidden="true" />
                      Fijada
                    </span>
                  )}
                </div>
                <p className={cn('mt-1.5 text-sm', isWarning ? 'font-semibold text-red-800' : 'text-neutral-black-80')}>{n.text}</p>
                <p className="mt-1 text-xs text-neutral-black-80/70">
                  {n.authorName}{role && ` · ${role}`} · {formatNoteDate(n.createdAt)}
                  {n.photos.length > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <Camera className="size-3.5" aria-hidden="true" />
                      {n.photos.length} {n.photos.length === 1 ? 'foto' : 'fotos'}
                    </span>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
