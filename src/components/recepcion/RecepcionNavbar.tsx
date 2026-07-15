"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import { ClipboardList, Map, PlusCircle, Bike, MoreHorizontal, BarChart3 } from 'lucide-react';
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

  return (
    <NavPillShell navShadow={navShadow} innerClassName="lg:max-w-none">
      {/* Left: Avatar + Kitchen selector */}
      <div className="flex items-center gap-2">
        <NavWorkerAvatar />
        {kitchens.length > 0 && (
          <NavKitchenDropdown
            kitchens={kitchens}
            selectedKitchen={selectedKitchen}
            onKitchenChange={onKitchenChange}
            variant="pill"
          />
        )}
      </div>

      {/* Center: Logo */}
      <NavPillLogo href="/recepcion" />

      {/* Right: Nav buttons */}
      <div className="flex items-center justify-end gap-2">

        {/* Desktop: botones secundarios visibles en línea */}
        <div className="hidden lg:flex items-center gap-2">
          <Button
            variant="light-outline"
            size="md"
            leftIcon={<Bike className="w-5 h-5" />}
            badge={activeCouriers.length > 0 ? activeCouriers.length : undefined}
            onClick={openPanel}
            className="h-12 pl-5 pr-3 text-base"
          >
            MOTOS
          </Button>

          <Link href="/recepcion/contabilidad" tabIndex={-1} className="focus:outline-0! focus:ring-0! rounded-full">
            <Button
              variant={pathname === '/recepcion/contabilidad' ? 'primary' : 'light-outline'}
              size="md"
              leftIcon={<BarChart3 className="w-5 h-5" />}
              className="h-12 pl-5 pr-3 text-base"
            >
              CONTABILIDAD
            </Button>
          </Link>

          <Link href="/recepcion/mapa" tabIndex={-1} className="focus:outline-0! focus:ring-0! rounded-full">
            <Button
              variant={pathname === '/recepcion/mapa' ? 'primary' : 'light-outline'}
              size="md"
              leftIcon={<Map className="w-5 h-5" />}
              className="h-12 pl-5 pr-3 text-base"
            >
              MAPA
            </Button>
          </Link>
        </div>

        {/* Mobile/Tablet: dropdown "más" con los botones secundarios */}
        <div ref={moreRef} className="relative lg:hidden">
          <Button
            variant="light-outline"
            size="md"
            leftIcon={<MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />}
            badge={activeCouriers.length > 0 ? activeCouriers.length : undefined}
            onClick={() => setMoreOpen((v) => !v)}
            className={cn(
              'h-10 px-3 text-sm',
              moreOpen && 'bg-neutral-black-10',
            )}
          />

          {moreOpen && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-neutral-black-20 shadow-lg rounded-2xl py-1.5 z-50">
              <button
                onClick={() => { openPanel(); setMoreOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-neutral-black-80 hover:bg-neutral-black-10 rounded-xl transition-colors"
              >
                <Bike className="w-4 h-4 shrink-0" />
                MOTOS
                {activeCouriers.length > 0 && (
                  <span className="ml-auto flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-sm font-bold bg-accent-yellow-10 text-neutral-black-80">
                    {activeCouriers.length}
                  </span>
                )}
              </button>

              <Link href="/recepcion/contabilidad" onClick={() => setMoreOpen(false)}>
                <span className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-neutral-black-10 rounded-xl transition-colors',
                  pathname === '/recepcion/contabilidad' ? 'text-primary-red' : 'text-neutral-black-80',
                )}>
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  CONTABILIDAD
                </span>
              </Link>

              <Link href="/recepcion/mapa" onClick={() => setMoreOpen(false)}>
                <span className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-neutral-black-10 rounded-xl transition-colors',
                  pathname === '/recepcion/mapa' ? 'text-primary-red' : 'text-neutral-black-80',
                )}>
                  <Map className="w-4 h-4 shrink-0" />
                  MAPA
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* CREAR — siempre visible */}
        <Link href="/recepcion/nueva-orden" tabIndex={-1} className="focus:outline-0! focus:ring-0! rounded-full">
          <Button
            variant={pathname === '/recepcion/nueva-orden' ? 'primary' : 'light-outline'}
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4 md:w-5 md:h-5" />}
            className="h-10 lg:h-12 ps-3 pe-2 lg:pl-5 lg:pr-3 text-sm lg:text-base"
          >
            <span className="hidden sm:inline">CREAR</span>
          </Button>
        </Link>

        {/* PEDIDOS — siempre visible */}
        <Link href="/recepcion" tabIndex={-1} className="focus:outline-0! focus:ring-0! rounded-full">
          <Button
            variant={pathname === '/recepcion' ? 'primary' : 'light-outline'}
            size="md"
            leftIcon={<ClipboardList className="w-4 h-4 md:w-5 md:h-5" />}
            badge={activeOrders.length > 0 ? activeOrders.length : undefined}
            className="h-10 lg:h-12 ps-3 pe-2 lg:pl-5 lg:pr-3 text-sm lg:text-base"
          >
            <span className="hidden sm:inline">PEDIDOS</span>
          </Button>
        </Link>
      </div>
    </NavPillShell>
  );
};
