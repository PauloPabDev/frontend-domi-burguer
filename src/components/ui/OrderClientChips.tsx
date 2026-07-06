'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Phone, UserRound } from 'lucide-react';
import { addToast } from '@heroui/toast';
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

function showClientToast({
  name,
  phone,
  clientId,
  avatarSrc,
}: {
  name?: string;
  phone?: string;
  clientId?: string;
  avatarSrc: string;
}) {
  addToast({
    classNames: {
      base: 'p-0 overflow-hidden border border-neutral-black-10 rounded-2xl shadow-lg bg-white w-[300px] min-w-[300px]',
      closeButton: 'absolute top-2 right-2 z-50 visible opacity-100',
      content: 'hidden',
    },
    variant: 'flat',
    hideIcon: true,
    title: '',
    description: '',
    timeout: 6000,
    endContent: (
      <div className="w-[300px]">
        {/* Header del toast */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-neutral-100">
          <Image
            src={avatarSrc}
            alt={name ?? 'Cliente'}
            width={36}
            height={36}
            className="rounded-full object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold text-neutral-black-80 truncate">{name ?? 'Cliente'}</p>
            {phone && <p className="text-xs text-neutral-black-50">{phone}</p>}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col divide-y divide-neutral-100">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-black-80 hover:bg-neutral-50 transition-colors"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                <Phone size={15} className="text-green-600" />
              </span>
              Llamar al cliente
            </a>
          )}

          <Link
            href={clientId ? `/clientes/${clientId}` : '#'}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-black-80 hover:bg-neutral-50 transition-colors"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
              <UserRound size={15} className="text-blue-600" />
            </span>
            Ver más detalles
          </Link>
        </div>
      </div>
    ),
  });
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
  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    showClientToast({ name, phone, clientId, avatarSrc });
  };

  return (
    <div className={cn('flex flex-col gap-1.5 min-w-0', className)}>
      <div className="flex items-center gap-2">
        {/* Chip: avatar + nombre — clickeable */}
        <button
          type="button"
          onClick={handleAvatarClick}
          className="flex items-center gap-1.5 bg-neutral-100 rounded-full pl-0.5 pr-3 py-0.5 shrink-0 hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          <Image
            src={avatarSrc}
            alt={name ?? 'Cliente'}
            width={24}
            height={24}
            className="rounded-full object-cover"
          />
          <span className="text-sm font-semibold text-neutral-black-80 truncate max-w-[110px]">
            {name ?? 'Cliente'}
          </span>
        </button>

        {/* Chip: número de pedido */}
        <div className="flex items-center bg-primary-red rounded-full px-2.5 py-1 shrink-0">
          <span className="text-xs font-bold text-white">#{orderNumber}</span>
        </div>
      </div>

      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-1 text-xs text-neutral-black-50 hover:text-primary-red ml-1"
          onClick={onPhoneClick}
        >
          <Phone size={10} />
          {phone}
        </a>
      )}
    </div>
  );
}
