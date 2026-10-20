"use client";

import { usePathname } from 'next/navigation';
import { ChefHat, BookOpen } from 'lucide-react';
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

  return (
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
};
