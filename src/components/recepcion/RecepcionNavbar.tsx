"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, History, PlusCircle } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { WorkerKitchen } from '@/types/worker';
import { Button } from '@/components/ui/button';
import { useNavShadow } from '@/components/navbar/useNavShadow';
import { NavWorkerAvatar } from '@/components/navbar/NavWorkerAvatar';
import { NavPillShell } from '@/components/navbar/NavPillShell';
import { NavPillLogo } from '@/components/navbar/NavPillLogo';
import { NavKitchenDropdown } from '@/components/navbar/NavKitchenDropdown';
import { NavLogoutButton } from '@/components/navbar/NavLogoutButton';

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
  const pathname = usePathname();
  const navShadow = useNavShadow(connectionStatus);

  const activeOrders = orders.filter(
    (o) => o.status === 'fresh' || o.status === 'preparing' || o.status === 'ready_for_pickup',
  );

  return (
    <NavPillShell navShadow={navShadow}>
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

      {/* Right: Nav buttons + logout */}
      <div className="flex items-center justify-end gap-2">
        <Link href="/recepcion/nueva-orden" tabIndex={-1} className="focus:outline-0! focus:ring-0! rounded-full">
          <Button
            variant={pathname === '/recepcion/nueva-orden' ? 'primary' : 'light-outline'}
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4 md:w-5 md:h-5" />}
            className="h-10 lg:h-12 ps-3 pe-2 lg:pl-5 lg:pr-3 text-sm lg:text-base"
          >
            <span className="hidden sm:inline"></span>
          </Button>
        </Link>



        <Link href="/recepcion" tabIndex={-1} className="focus:outline-0! focus:ring-0! rounded-full">
          <Button
            variant="primary"
            size="md"
            leftIcon={<ClipboardList className="w-4 h-4 md:w-5 md:h-5 text-white" />}
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
