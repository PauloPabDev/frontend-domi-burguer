"use client";

import { TriangleAlert } from 'lucide-react';
import type { Note } from '@/types/notes';
import { alertNotes } from './utils';

/** Caja roja con las notas "Cuidado" del cliente; no renderiza nada si no hay. */
export function ClientAlerts({ notes }: { notes: Note[] }) {
  const alerts = alertNotes(notes);
  if (alerts.length === 0) return null;

  return (
    <ul aria-label="Alertas del cliente" className="flex flex-col gap-1.5 rounded-xl border border-red-200 bg-red-50 p-3">
      {alerts.map((n) => (
        <li key={n.id} className="flex items-start gap-2 text-sm font-semibold text-red-800">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{n.text}</span>
        </li>
      ))}
    </ul>
  );
}
