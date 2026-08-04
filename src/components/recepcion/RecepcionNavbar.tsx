"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useEffect, useState, ElementType } from 'react';
import { ClipboardList, Map, PlusCircle, Bike, MoreHorizontal, BarChart3, IdCard } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { WorkerKitchen } from '@/types/worker';
import { Button } from '@/components/ui/button';
import { useNavShadow } from '@/components/navbar/useNavShadow';
import { NavWorkerAvatar } from '@/components/navbar/NavWorkerAvatar';
import { NavPillShell } from '@/components/navbar/NavPillShell';
import { NavPillLogo } from '@/components/navbar/NavPillLogo';
import { NavKitchenDropdown } from '@/components/navbar/NavKitchenDropdown';
import { useCourierPanel } from '@/contexts/CourierPanelContext';
import { cn } from '@/lib/utils';

interface RecepcionNavbarProps {
  kitchens?: WorkerKitchen[];
  selectedKitchen?: WorkerKitchen | null;
  onKitchenChange?: (id: string | null) => void;
}

interface NavItem {
  key: string;
  label: string;
  Icon: ElementType;
  href?: string;
  onClick?: () => void;
  badge?: number;
}

export const RecepcionNavbar: React.FC<RecepcionNavbarProps> = ({
  kitchens = [],
  selectedKitchen = null,
  onKitchenChange,
}) => {
  const { orders, connectionStatus } = useSocket();
  const { activeCouriers, openPanel } = useCourierPanel();
  const pathname = usePathname();
  const navShadow = useNavShadow(connectionStatus);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const activeOrders = orders.filter(
    (o) => o.status === 'fresh' || o.status === 'preparing' || o.status === 'ready_for_pickup',
  );

  useEffect(() => {
    if (!moreOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreOpen]);

  // Todos los botones de la derecha: en pantallas grandes van en línea, en
  // pantallas chicas su contenido se colapsa dentro del dropdown "más".
  const navItems: NavItem[] = [
    {
      key: 'motos',
      label: 'MOTOS',
      Icon: Bike,
      onClick: openPanel,
      badge: activeCouriers.length > 0 ? activeCouriers.length : undefined,
    },
    { key: 'contabilidad', label: 'CONTABILIDAD', Icon: BarChart3, href: '/recepcion/contabilidad' },
    { key: 'mapa', label: 'MAPA', Icon: Map, href: '/recepcion/mapa' },
    { key: 'cliente', label: 'CLIENTE', Icon: IdCard, href: '/recepcion/cliente' },
    { key: 'crear', label: 'CREAR', Icon: PlusCircle, href: '/recepcion/nueva-orden' },
    {
      key: 'pedidos',
      label: 'PEDIDOS',
      Icon: ClipboardList,
      href: '/recepcion',
      badge: activeOrders.length > 0 ? activeOrders.length : undefined,
    },
  ];

  const pendingCount = activeCouriers.length + activeOrders.length;

  return (
    <NavPillShell navShadow={navShadow} innerClassName="lg:max-w-none">
      {/* Left: Avatar + Kitchen selector — se reducen a solo ícono por debajo de lg */}
      <div className="flex items-center gap-1.5 lg:gap-2 min-w-0">
        <NavWorkerAvatar compact />
        {kitchens.length > 0 && (
          <NavKitchenDropdown
            kitchens={kitchens}
            selectedKitchen={selectedKitchen}
            onKitchenChange={onKitchenChange}
            variant="pill"
            compact
          />
        )}
      </div>

      {/* Center: Logo */}
      <NavPillLogo href="/recepcion" />

      {/* Right: Nav buttons */}
      <div className="flex items-center justify-end">

        {/* Desktop: todos los botones visibles en línea */}
        <div className="hidden lg:flex items-center gap-2">
          {navItems.map(({ key, label, Icon, href, onClick, badge }) =>
            href ? (
              <Link key={key} href={href} tabIndex={-1} className="focus:outline-0! focus:ring-0! rounded-full">
                <Button
                  variant={pathname === href ? 'primary' : 'light-outline'}
                  size="md"
                  leftIcon={<Icon className="w-5 h-5" />}
                  badge={badge}
                  className="h-12 pl-5 pr-3 text-base"
                >
                  {label}
                </Button>
              </Link>
            ) : (
              <Button
                key={key}
                variant="light-outline"
                size="md"
                leftIcon={<Icon className="w-5 h-5" />}
                badge={badge}
                onClick={onClick}
                className="h-12 pl-5 pr-3 text-base"
              >
                {label}
              </Button>
            ),
          )}
        </div>

        {/* Mobile/Tablet: dropdown "más" con el contenido de todos los botones */}
        <div ref={moreRef} className="relative lg:hidden">
          <Button
            variant="light-outline"
            size="md"
            leftIcon={<MoreHorizontal className="w-5 h-5" />}
            badge={pendingCount > 0 ? pendingCount : undefined}
            onClick={() => setMoreOpen((v) => !v)}
            className={cn(
              'h-10 px-3 text-sm',
              moreOpen && 'bg-neutral-black-10',
            )}
          />

          {moreOpen && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-neutral-black-20 shadow-lg rounded-2xl py-1.5 z-50">
              {navItems.map(({ key, label, Icon, href, onClick, badge }) => {
                const isActive = href ? pathname === href : false;
                const content = (
                  <span
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold rounded-xl transition-colors',
                      isActive ? 'text-primary-red' : 'text-neutral-black-80',
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                    {badge !== undefined && (
                      <span className="ml-auto flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-sm font-bold bg-accent-yellow-10 text-neutral-black-80">
                        {badge}
                      </span>
                    )}
                  </span>
                );

                return href ? (
                  <Link key={key} href={href} onClick={() => setMoreOpen(false)} className="block hover:bg-neutral-black-10 rounded-xl">
                    {content}
                  </Link>
                ) : (
                  <button
                    key={key}
                    onClick={() => { onClick?.(); setMoreOpen(false); }}
                    className="w-full text-left hover:bg-neutral-black-10 rounded-xl transition-colors"
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </NavPillShell>
  );
};
