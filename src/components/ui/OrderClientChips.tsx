'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Phone, UserRound, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Paleta cálida para avatares sin foto: cada letra cae siempre en el mismo color
const AVATAR_COLORS = [
  'bg-rose-400',
  'bg-orange-400',
  'bg-amber-500',
  'bg-lime-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-sky-500',
  'bg-indigo-400',
  'bg-violet-400',
  'bg-fuchsia-400',
  'bg-pink-400',
  'bg-red-400',
] as const;

function getInitial(name?: string): string {
  const letter = name?.trim().charAt(0);
  return letter ? letter.toLocaleUpperCase('es') : '?';
}

function getAvatarColor(initial: string): string {
  // Quita tildes para que "Á" y "A" compartan color
  const base = initial.normalize('NFD').charCodeAt(0);
  return AVATAR_COLORS[base % AVATAR_COLORS.length];
}

interface ClientAvatarProps {
  src?: string;
  name?: string;
  size: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

function ClientAvatar({ src, name, size, className, onClick }: ClientAvatarProps) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name ?? 'Cliente'}
        width={size}
        height={size}
        className={cn('rounded-full object-cover shrink-0', className)}
        onClick={onClick}
        onError={() => setFailed(true)}
      />
    );
  }

  const initial = getInitial(name);
  return (
    <span
      role="img"
      aria-label={name ?? 'Cliente'}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.45) }}
      className={cn(
        'flex items-center justify-center rounded-full font-bold text-white select-none shrink-0',
        getAvatarColor(initial),
        className,
      )}
      onClick={onClick}
    >
      {initial}
    </span>
  );
}

// ─── OrderNumberChip ───────────────────────────────────────────────────────────

interface OrderNumberChipProps {
  orderNumber: number;
  className?: string;
}

export function OrderNumberChip({ orderNumber, className }: OrderNumberChipProps) {
  return (
    <div className={cn('flex items-center bg-primary-red rounded-full px-3.5 py-1.5 shrink-0', className)}>
      <span className="text-base font-bold text-white">{orderNumber}</span>
    </div>
  );
}

// ─── OrderClientChip ──────────────────────────────────────────────────────────

interface ClientActionMenuProps {
  name?: string;
  phone?: string;
  clientId?: string;
  avatarSrc?: string;
  onClose: () => void;
}

function ClientActionMenu({ name, phone, clientId, avatarSrc, onClose }: ClientActionMenuProps) {
  return createPortal(
    <div className="fixed inset-0 z-500 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div
        className="relative z-10 w-[300px] bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
          <ClientAvatar src={avatarSrc} name={name} size={40} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-neutral-black-80 truncate">{name ?? 'Cliente'}</p>
            {phone && <p className="text-xs text-neutral-black-100">{phone}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-1 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={16} className="text-neutral-black-100" />
          </button>
        </div>

        <div className="flex flex-col divide-y divide-neutral-100">
          {phone && (
            <a
              href={`tel:${phone}`}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-neutral-black-80 hover:bg-neutral-50 transition-colors"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 shrink-0">
                <Phone size={15} className="text-green-600" />
              </span>
              Llamar al cliente
            </a>
          )}

          <Link
            href={clientId ? `/clientes/${clientId}` : '#'}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-neutral-black-80 hover:bg-neutral-50 transition-colors"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 shrink-0">
              <UserRound size={15} className="text-blue-600" />
            </span>
            Ver más detalles
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// Origen del cliente en la orden: usuario registrado, cliente creado por recepción, o cliente anónimo
export type ClientOriginKey = 'user' | 'client' | 'client-user';

export function getClientOriginKey(isUser: boolean, origin?: 'public' | null): ClientOriginKey {
  return isUser ? 'user' : origin === 'public' ? 'client-user' : 'client';
}

// Color de fondo de toda la card de orden según origen.
// `client` (creado por recepción) no se pinta: queda con el fondo por defecto.
export const cardOriginColorMap: Record<ClientOriginKey, string | null> = {
  user: 'bg-blue-50 border-blue-200',
  'client-user': 'bg-amber-50 border-amber-200',
  client: null,
};

// Colores por variante de chip y tipo de usuario
const chipColorMap = {
  // Chip expandido: muestra nombre + teléfono
  expanded: {
    user: 'bg-blue-100 hover:bg-blue-200', // usuario registrado → azul
    client: 'bg-green-100 hover:bg-green-200',  // cliente creado por recepción → verde
    'client-user': 'bg-amber-100 hover:bg-amber-200',// cliente sin cuenta → amarillo
  },
  // Chip compacto: solo nombre, sin teléfono visible
  compact: {
    user: 'bg-blue-200 hover:bg-blue-300', // usuario registrado → azul
    client: 'bg-green-200 hover:bg-green-300',  // cliente creado por recepción → verde
    'client-user': 'bg-amber-200 hover:bg-amber-300',// cliente sin cuenta → amarillo
  },
} as const;

interface OrderClientChipProps {
  name?: string;
  phone?: string;
  clientId?: string;
  avatarSrc?: string;
  className?: string;
  phoneVisible?: boolean;
  isUser?: boolean;
  origin?: 'public' | null;
  /** sm: fila a todo el ancho con nombre completo (card compacta de recepción) */
  size?: 'md' | 'sm';
}

export function OrderClientChip({
  name,
  phone,
  clientId,
  avatarSrc,
  className,
  phoneVisible = false,
  isUser = false,
  origin = null,
  size = 'md',
}: OrderClientChipProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  //las opciones son:  usuario registrado (user) o cliente anomimo (client-user) , y cliente credo por recepcion (client)
  const userKey = getClientOriginKey(isUser, origin);

  const handleOpen = (e: React.MouseEvent) => { e.stopPropagation(); setMenuOpen(true); };
  return (
    <>
      {phoneVisible ? (
        <div className={cn(
          'flex items-center gap-2 rounded-2xl pl-1 pr-4 py-1 shrink-0',
          chipColorMap.expanded[userKey],
          className,
        )}>
          <ClientAvatar
            src={avatarSrc}
            name={name}
            size={30}
            className="cursor-pointer"
            onClick={handleOpen}
          />
          <div className="flex flex-col items-start min-w-0">
            <button type="button" onClick={handleOpen} className="text-left w-full">
              <span className="text-base font-bold text-neutral-black-80 truncate max-w-[110px] block">
                {name ?? 'Cliente'}
              </span>
            </button>
            {phone && (
              <a
                href={`tel:${phone}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-blue-600 hover:underline leading-tight"
              >
                {phone}
              </a>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className={cn(
            'flex items-center rounded-full pl-1 py-1 shrink-0 transition-colors',
            size === 'sm' ? 'w-full gap-2 rounded-lg pr-2 text-left' : 'gap-2 pr-4',
            chipColorMap.compact[userKey],
            className,
          )}
        >
          <ClientAvatar src={avatarSrc} name={name} size={size === 'sm' ? 26 : 30} />
          <span
            className={cn(
              'font-bold text-neutral-black-80',
              size === 'sm' ? 'text-sm leading-tight line-clamp-2 min-w-0' : 'text-base truncate max-w-[110px]',
            )}
          >
            {name ?? 'Cliente'}
          </span>
        </button>
      )}

      {menuOpen && (
        <ClientActionMenu
          name={name}
          phone={phone}
          clientId={clientId}
          avatarSrc={avatarSrc}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}

// ─── OrderTimeChip ────────────────────────────────────────────────────────────

interface OrderTimeChipProps {
  time: string;
  className?: string;
}

export function OrderTimeChip({ time, className }: OrderTimeChipProps) {
  return (
    <span className={cn('text-xs font-semibold text-neutral-black-100 shrink-0', className)}>
      {time}
    </span>
  );
}
