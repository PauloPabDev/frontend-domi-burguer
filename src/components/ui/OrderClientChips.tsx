'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Phone, UserRound, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_AVATAR = 'https://i.pravatar.cc/32?img=12';

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
  avatarSrc: string;
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
          <img
            src={avatarSrc}
            alt={name ?? 'Cliente'}
            width={40}
            height={40}
            className="rounded-full object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-neutral-black-80 truncate">{name ?? 'Cliente'}</p>
            {phone && <p className="text-xs text-neutral-black-50">{phone}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-1 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={16} className="text-neutral-black-50" />
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
}

export function OrderClientChip({
  name,
  phone,
  clientId,
  avatarSrc = MOCK_AVATAR,
  className,
  phoneVisible = false,
  isUser = false,
  origin = null,
}: OrderClientChipProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  //las opciones son:  usuario registrado (user) o cliente anomimo (client-user) , y cliente credo por recepcion (client)
  const userKey = isUser ? 'user' : origin === 'public' ? 'client-user' : 'client';

  const handleOpen = (e: React.MouseEvent) => { e.stopPropagation(); setMenuOpen(true); };
  return (
    <>
      {phoneVisible ? (
        <div className={cn(
          'flex items-center gap-2 rounded-2xl pl-1 pr-4 py-1 shrink-0',
          chipColorMap.expanded[userKey],
          className,
        )}>
          <img
            src={avatarSrc}
            alt={name ?? 'Cliente'}
            width={30}
            height={30}
            className="rounded-full object-cover cursor-pointer shrink-0"
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
            'flex items-center gap-2 rounded-full pl-1 pr-4 py-1 shrink-0 transition-colors',
            chipColorMap.compact[userKey],
            className,
          )}
        >
          <img
            src={avatarSrc}
            alt={name ?? 'Cliente'}
            width={30}
            height={30}
            className="rounded-full object-cover"
          />
          <span className="text-base font-bold text-neutral-black-80 truncate max-w-[110px]">
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
    <span className={cn('text-xs font-semibold text-neutral-black-50 shrink-0', className)}>
      {time}
    </span>
  );
}
