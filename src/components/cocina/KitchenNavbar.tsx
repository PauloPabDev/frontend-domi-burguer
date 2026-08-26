"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChefHat, BookOpen } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { WorkerKitchen } from '@/types/worker';
import { Button } from '@/components/ui/button';
import { useNavShadow } from '@/components/navbar/useNavShadow';
import { NavWorkerAvatar } from '@/components/navbar/NavWorkerAvatar';
import { NavPillShell } from '@/components/navbar/NavPillShell';
import { NavPillLogo } from '@/components/navbar/NavPillLogo';
import { NavKitchenDropdown } from '@/components/navbar/NavKitchenDropdown';

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

  return (
    <NavPillShell navShadow={navShadow}>
      {/* Left: Avatar + Kitchen selector */}
      <div className="flex items-center gap-2">
        <NavWorkerAvatar />
        <NavKitchenDropdown
          kitchens={kitchens}
          selectedKitchen={selectedKitchen}
          onKitchenChange={onKitchenChange}
          variant="pill"
        />
      </div>

      {/* Center: Logo */}
      <NavPillLogo href="/cocina" />

      {/* Right: Documentos + Orders badge */}
      <div className="flex items-center justify-end gap-2">
        <Link href="/cocina/documentos" tabIndex={-1} className="focus:outline-0! focus:ring-0! rounded-full">
          <Button
            variant={isOnDocumentos ? 'primary' : 'light-outline'}
            size="md"
            leftIcon={<BookOpen className="w-4 h-4 md:w-5 md:h-5" />}
            className="h-10 lg:h-12 ps-3 pe-2 lg:pl-5 lg:pr-3 text-sm lg:text-base"
          >
            <span className="hidden sm:inline">DOCUMENTOS</span>
          </Button>
        </Link>
        <Link href="/cocina" tabIndex={-1} className="focus:outline-0! focus:ring-0! rounded-full">
          <Button
            variant="primary"
            size="md"
            leftIcon={<ChefHat className="w-4 h-4 md:w-5 md:h-5 text-white" />}
            badge={activeOrders.length > 0 ? activeOrders.length : undefined}
            className="h-10 lg:h-12 ps-3 pe-2 lg:pl-5 lg:pr-3 text-sm lg:text-base"
          >
            <span className="hidden sm:inline">ÓRDENES</span>
          </Button>
        </Link>
      </div>
    </NavPillShell>
  );
};
