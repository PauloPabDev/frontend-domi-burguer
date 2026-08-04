"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useEffect, useState, ElementType } from 'react';
import { ClipboardList, Map, PlusCircle, Bike, MoreHorizontal, BarChart3, IdCard } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { WorkerKitchen } from '@/types/worker';
import { Button } from '@/components/ui/button';
import { useNavShadow } from '@/components/navbar/useNavShadow';
import { useOverflowNav } from '@/components/navbar/useOverflowNav';
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
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  const activeOrders = orders.filter(
    (o) => o.status === 'fresh' || o.status === 'preparing' || o.status === 'ready_for_pickup',
  );

  useEffect(() => {
    if (!moreOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreOpen]);

  // Todos los botones de la derecha, en orden de prioridad. El hook decide,
  // según el espacio real disponible, cuántos entran en línea; el resto pasa
  // al dropdown "más" — solo los que no caben, no todos de una vez.
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

  const maxPendingBadge = activeCouriers.length + activeOrders.length;
  const { containerRef, measureRef, moreRef, visibleCount } = useOverflowNav({ itemCount: navItems.length });
  const visibleItems = navItems.slice(0, visibleCount);
  const overflowItems = navItems.slice(visibleCount);
  const overflowBadge = overflowItems.reduce((sum, item) => sum + (item.badge ?? 0), 0);

  const renderInlineButton = (item: NavItem) => {
    const isActive = item.href ? pathname === item.href : false;
    return item.href ? (
      <Link key={item.key} href={item.href} tabIndex={-1} className="focus:outline-0! focus:ring-0! rounded-full shrink-0">
        <Button
          variant={isActive ? 'primary' : 'light-outline'}
          size="md"
          leftIcon={<item.Icon className="w-4 h-4 md:w-5 md:h-5" />}
          badge={item.badge}
          className="h-10 lg:h-12 ps-3 pe-2 lg:pl-5 lg:pr-3 text-sm lg:text-base"
        >
          {item.label}
        </Button>
      </Link>
    ) : (
      <Button
        key={item.key}
        variant="light-outline"
        size="md"
        leftIcon={<item.Icon className="w-4 h-4 md:w-5 md:h-5" />}
        badge={item.badge}
        onClick={item.onClick}
        className="h-10 lg:h-12 ps-3 pe-2 lg:pl-5 lg:pr-3 text-sm lg:text-base shrink-0"
      >
        {item.label}
      </Button>
    );
  };

  const renderMenuItem = (item: NavItem) => {
    const isActive = item.href ? pathname === item.href : false;
    const content = (
      <span
        className={cn(
          'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold rounded-xl transition-colors',
          isActive ? 'text-primary-red' : 'text-neutral-black-80',
        )}
      >
        <item.Icon className="w-4 h-4 shrink-0" />
        {item.label}
        {item.badge !== undefined && (
          <span className="ml-auto flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-sm font-bold bg-accent-yellow-10 text-neutral-black-80">
            {item.badge}
          </span>
        )}
      </span>
    );

    return item.href ? (
      <Link key={item.key} href={item.href} onClick={() => setMoreOpen(false)} className="block hover:bg-neutral-black-10 rounded-xl">
        {content}
      </Link>
    ) : (
      <button
        key={item.key}
        onClick={() => { item.onClick?.(); setMoreOpen(false); }}
        className="w-full text-left hover:bg-neutral-black-10 rounded-xl transition-colors"
      >
        {content}
      </button>
    );
  };

  return (
    <NavPillShell navShadow={navShadow} innerClassName="lg:max-w-none">
      {/* Left: Avatar + Kitchen selector — se reducen a solo ícono por debajo de lg */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5 lg:gap-2">
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

      {/* Right: solo los botones que caben se muestran en línea; el resto
          entra al dropdown "más", medido dinámicamente según el espacio real. */}
      <div ref={containerRef} className="flex-1 min-w-0 flex items-center justify-end gap-2 overflow-hidden">
        {visibleItems.map(renderInlineButton)}

        {overflowItems.length > 0 && (
          <div ref={moreDropdownRef} className="relative shrink-0">
            <Button
              variant="light-outline"
              size="md"
              leftIcon={<MoreHorizontal className="w-5 h-5" />}
              badge={overflowBadge > 0 ? overflowBadge : undefined}
              onClick={() => setMoreOpen((v) => !v)}
              className={cn('h-10 lg:h-12 px-3', moreOpen && 'bg-neutral-black-10')}
            />

            {moreOpen && (
              <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-neutral-black-20 shadow-lg rounded-2xl py-1.5 z-50">
                {overflowItems.map(renderMenuItem)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fila de medición: invisible y fuera de flujo, siempre con todos los
          ítems, para calcular cuántos caben realmente en el espacio disponible. */}
      <div
        aria-hidden="true"
        className="flex items-center gap-2 pointer-events-none"
        style={{ visibility: 'hidden', position: 'absolute', top: -9999, left: -9999 }}
      >
        <div ref={measureRef} className="flex items-center gap-2">
          {navItems.map(renderInlineButton)}
        </div>
        <div ref={moreRef}>
          <Button
            variant="light-outline"
            size="md"
            leftIcon={<MoreHorizontal className="w-5 h-5" />}
            badge={maxPendingBadge > 0 ? maxPendingBadge : undefined}
            className="h-10 lg:h-12 px-3"
          />
        </div>
      </div>
    </NavPillShell>
  );
};
