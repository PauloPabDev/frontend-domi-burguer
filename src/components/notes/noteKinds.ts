import { Lightbulb, TriangleAlert, Heart, DoorOpen, MessageSquare, type LucideIcon } from 'lucide-react';
import { NoteKind } from '@/types/notes';

export interface NoteKindConfig {
  label: string;
  hint: string;
  icon: LucideIcon;
  /** clases del chip del tipo en la tarjeta */
  chip: string;
  /** clases del botón del selector cuando está elegido */
  active: string;
}

export const NOTE_KINDS: Record<NoteKind, NoteKindConfig> = {
  tip: {
    label: 'Consejo',
    hint: 'Algo útil para quien atienda después',
    icon: Lightbulb,
    chip: 'bg-blue-50 text-blue-700 border-blue-100',
    active: 'border-blue-400 bg-blue-50 text-blue-700',
  },
  warning: {
    label: 'Cuidado',
    hint: 'Perro bravo, zona difícil, algo a tener en cuenta',
    icon: TriangleAlert,
    chip: 'bg-amber-50 text-amber-700 border-amber-100',
    active: 'border-amber-400 bg-amber-50 text-amber-700',
  },
  praise: {
    label: 'Buen trato',
    hint: 'Cliente amable, buena propina',
    icon: Heart,
    chip: 'bg-green-50 text-green-700 border-green-100',
    active: 'border-green-400 bg-green-50 text-green-700',
  },
  access: {
    label: 'Acceso',
    hint: 'Cómo llegar: portería, timbre, puerta',
    icon: DoorOpen,
    chip: 'bg-violet-50 text-violet-700 border-violet-100',
    active: 'border-violet-400 bg-violet-50 text-violet-700',
  },
  other: {
    label: 'Nota',
    hint: 'Cualquier otra observación',
    icon: MessageSquare,
    chip: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    active: 'border-neutral-400 bg-neutral-100 text-neutral-700',
  },
};

export const NOTE_KIND_ORDER: NoteKind[] = ['tip', 'warning', 'praise', 'access', 'other'];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  supervisor: 'Supervisor',
  reception: 'Recepción',
  courier: 'Domiciliario',
  cook: 'Cocina',
};

export const roleLabel = (role: string) => ROLE_LABELS[role] ?? '';

/** "hace 5 min", "hace 3 h", "hace 2 d"; pasados 30 días, la fecha corta. */
export function formatNoteDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} d`;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}
