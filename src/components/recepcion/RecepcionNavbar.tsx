"use client";

import { ClipboardList, History, PlusCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSocket } from '@/contexts/SocketContext';
import { WorkerKitchen } from '@/types/worker';
import { NavStickyShell } from '@/components/navbar/NavStickyShell';
import { NavLinkItem } from '@/components/navbar/NavLinkItem';
import { NavLogoutButton } from '@/components/navbar/NavLogoutButton';
import { NavConnectionDot } from '@/components/navbar/NavConnectionDot';
import { NavKitchenDropdown } from '@/components/navbar/NavKitchenDropdown';

interface RecepcionNavbarProps {
  kitchens?: WorkerKitchen[];
  selectedKitchen?: WorkerKitchen | null;
  onKitchenChange?: (id: string | null) => void;
}

const NAV_LINKS = [
  { href: '/recepcion',             label: 'Pedidos',     Icon: ClipboardList },
  { href: '/recepcion/historial',   label: 'Historial',   Icon: History       },
  { href: '/recepcion/nueva-orden', label: 'Nueva Orden', Icon: PlusCircle    },
];

export const RecepcionNavbar: React.FC<RecepcionNavbarProps> = ({
  kitchens = [],
  selectedKitchen = null,
  onKitchenChange,
}) => {
  const { orders, connectionStatus } = useSocket();
  const pathname = usePathname();

  const activeOrders = orders.filter(
    (o) => o.status === 'fresh' || o.status === 'preparing' || o.status === 'ready_for_pickup',
  );

  return (
    <NavStickyShell>
      {/* Logo + kitchen selector */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-bold text-primary-red text-sm">DomiBurguer</span>
        <span className="text-neutral-black-20">|</span>

        {kitchens.length > 0 ? (
          <NavKitchenDropdown
            kitchens={kitchens}
            selectedKitchen={selectedKitchen}
            onKitchenChange={onKitchenChange}
            variant="inline"
          />
        ) : (
          <span className="text-xs font-semibold text-neutral-black-50 bg-neutral-black-10 px-2 py-0.5 rounded-full">
            Recepción
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex items-center gap-1">
        {NAV_LINKS.map(({ href, label, Icon }) => (
          <NavLinkItem
            key={href}
            href={href}
            label={label}
            Icon={Icon}
            isActive={pathname === href}
          />
        ))}
      </nav>

      {/* Right: connection indicator + orders count + logout */}
      <div className="flex items-center gap-3">
        <NavConnectionDot status={connectionStatus} />
        {activeOrders.length > 0 && (
          <span className="min-w-[20px] h-5 flex items-center justify-center bg-primary-red text-white text-[10px] font-bold rounded-full px-1.5">
            {activeOrders.length}
          </span>
        )}
        <NavLogoutButton />
      </div>
    </NavStickyShell>
  );
};
