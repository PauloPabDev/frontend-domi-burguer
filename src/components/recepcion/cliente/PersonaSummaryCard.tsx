"use client";

import { Loader2, UserX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OrderClientInfo } from '@/components/ui/OrderClientInfo';
import { PersonaStatus } from '@/hooks/recepcion/useClientePanel';
import { cn } from '@/lib/utils';

const KIND_STYLES = {
  client: { badgeBg: 'bg-green-100', badgeText: 'text-green-700', ring: 'ring-green-200' },
  user: { badgeBg: 'bg-blue-100', badgeText: 'text-blue-700', ring: 'ring-blue-200' },
} as const;

interface PersonaSummaryCardProps {
  kind: 'client' | 'user';
  title: string;
  icon: React.ReactNode;
  status: PersonaStatus;
  name?: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  id?: string;
  meta?: string;
}

export function PersonaSummaryCard({
  kind,
  title,
  icon,
  status,
  name,
  phone,
  email,
  photoUrl,
  id,
  meta,
}: PersonaSummaryCardProps) {
  const styles = KIND_STYLES[kind];
  const initials = (name ?? '?').charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', styles.badgeBg, styles.badgeText)}>
          {icon}
          {title}
        </span>
        {id && <span className="text-[10px] text-neutral-black-30 truncate">#{id.slice(-6)}</span>}
      </div>

      {status === 'idle' && (
        <p className="text-sm text-neutral-black-40 italic py-2">Busca un número para ver la información</p>
      )}

      {status === 'loading' && (
        <div className="flex items-center gap-2 text-sm text-neutral-black-50 py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Buscando...
        </div>
      )}

      {status === 'not_found' && (
        <div className="flex items-center gap-2 text-sm text-neutral-black-40 py-2">
          <UserX className="w-4 h-4 shrink-0" />
          No se encontró {kind === 'client' ? 'un cliente' : 'un usuario'} con este número
        </div>
      )}

      {status === 'found' && (
        <div className="flex items-start gap-3">
          <Avatar className={cn('w-11 h-11 ring-2', styles.ring)}>
            {photoUrl && <AvatarImage src={photoUrl} alt={name ?? ''} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <OrderClientInfo name={name} phone={phone} nameSize="base" />
            {email && <p className="text-xs text-neutral-black-50 truncate mt-0.5">{email}</p>}
            {meta && <p className="text-xs text-neutral-black-40 mt-0.5">{meta}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
