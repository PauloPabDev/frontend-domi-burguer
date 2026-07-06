'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, UserRound, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_AVATAR = 'https://i.pravatar.cc/32?img=12';

interface OrderClientChipsProps {
  name?: string;
  phone?: string;
  clientId?: string;
  orderNumber: number;
  avatarSrc?: string;
  onPhoneClick?: (e: React.MouseEvent) => void;
  className?: string;
}

interface ClientActionMenuProps {
  name?: string;
  phone?: string;
  clientId?: string;
  avatarSrc: string;
  onClose: () => void;
}

function ClientActionMenu({ name, phone, clientId, avatarSrc, onClose }: ClientActionMenuProps) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div
        className="relative z-10 w-[300px] bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
          <Image
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

        {/* Acciones */}
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

export function OrderClientChips({
  name,
  phone,
  clientId,
  orderNumber,
  avatarSrc = MOCK_AVATAR,
  onPhoneClick,
  className,
}: OrderClientChipsProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(true);
  };

  return (
    <>
      <div className={cn('flex flex-col gap-1.5 min-w-0', className)}>
        <div className="flex items-center gap-2">
          {/* Chip: número de pedido */}
          <div className="flex items-center bg-primary-red rounded-full px-3.5 py-1.5 shrink-0">
            <span className="text-sm font-bold text-white">{orderNumber}</span>
          </div>
          {/* Chip: avatar + nombre */}
          <button
            type="button"
            onClick={handleAvatarClick}
            className="flex items-center gap-2 bg-neutral-100 rounded-full pl-1 pr-4 py-1 shrink-0 hover:bg-neutral-200 transition-colors"
          >
            <Image
              src={avatarSrc}
              alt={name ?? 'Cliente'}
              width={30}
              height={30}
              className="rounded-full object-cover"
            />
            <span className="text-sm font-semibold text-neutral-black-80 truncate max-w-[110px]">
              {name ?? 'Cliente'}
            </span>
          </button>


        </div>
      </div>

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
