"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChefHat, BookOpen, Menu, X } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { WorkerKitchen } from '@/types/worker';
import { useNavShadow } from '@/components/navbar/useNavShadow';
import { NavWorkerAvatar } from '@/components/navbar/NavWorkerAvatar';
import { NavPillShell } from '@/components/navbar/NavPillShell';
import { NavPillLogo } from '@/components/navbar/NavPillLogo';
import { NavKitchenDropdown } from '@/components/navbar/NavKitchenDropdown';
import { NavPillItem } from '@/components/navbar/NavPillItem';

interface KitchenNavbarProps {
  kitchens: WorkerKitchen[];
  selectedKitchen: WorkerKitchen | null;
  onKitchenChange: (id: string | null) => void;
  loadingKitchens?: boolean;
}

export const KitchenNavbar: React.FC<KitchenNavbarProps> = ({
  kitchens,
  selectedKitchen,
  onKitchenChange,
}) => {
  const { orders, connectionStatus } = useSocket();
  const navShadow = useNavShadow(connectionStatus);
  const pathname = usePathname();
  const activeOrders = orders.filter((o) => o.status === 'fresh' || o.status === 'preparing');
  const isOnDocumentos = pathname.startsWith('/cocina/documentos');
  // En el panel de órdenes el nav se colapsa en un botón flotante para dejar más espacio a las cards
  const collapsible = pathname === '/cocina';
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!collapsible || !open) return;
    const handleClick = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, [collapsible, open]);

  const nav = (
    <NavPillShell navShadow={navShadow}>
      {/* Left: Avatar + Kitchen selector — se reducen a solo ícono por debajo de lg */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5 lg:gap-2">
        <NavWorkerAvatar compact />
        <NavKitchenDropdown
          kitchens={kitchens}
          selectedKitchen={selectedKitchen}
          onKitchenChange={onKitchenChange}
          variant="pill"
          compact
        />
      </div>

      {/* Center: Logo */}
      <NavPillLogo href="/cocina" />

      {/* Right: Documentos + Orders badge */}
      <div className="flex-1 min-w-0 flex items-center justify-end gap-1.5 lg:gap-2">
        <NavPillItem
          label="DOCUMENTOS"
          Icon={BookOpen}
          href="/cocina/documentos"
          isActive={isOnDocumentos}
        />
        <NavPillItem
          label="ÓRDENES"
          Icon={ChefHat}
          href="/cocina"
          isActive
          badge={activeOrders.length > 0 ? activeOrders.length : undefined}
        />
      </div>
    </NavPillShell>
  );

  if (!collapsible) return nav;

  return (
    <div ref={containerRef}>
      {open && nav}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Ocultar menú' : 'Mostrar menú'}
        style={{ boxShadow: navShadow, transition: 'box-shadow 0.8s ease-in-out' }}
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-white border border-neutral-black-20 shadow-lg flex items-center justify-center text-neutral-black-80 cursor-pointer"
      >
        {open ? <X size={24} className="pointer-events-none" /> : <Menu size={24} className="pointer-events-none" />}
        {!open && activeOrders.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-6 h-6 px-1 rounded-full bg-primary-red text-white text-xs font-bold flex items-center justify-center">
            {activeOrders.length}
          </span>
        )}
      </button>
    </div>
  );
};
