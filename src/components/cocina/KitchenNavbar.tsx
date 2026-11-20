"use client";

import { usePathname } from 'next/navigation';
import { useSocket } from '@/contexts/SocketContext';
import { WorkerKitchen } from '@/types/worker';
import { WorkerNavbar } from '@/components/navbar/WorkerNavbar';

interface KitchenNavbarProps {
  kitchens: WorkerKitchen[];
  selectedKitchen: WorkerKitchen | null;
  onKitchenChange: (id: string | null) => void;
}

export const KitchenNavbar: React.FC<KitchenNavbarProps> = ({ kitchens, selectedKitchen, onKitchenChange }) => {
  const { orders } = useSocket();
  const pathname = usePathname();
  const activeOrders = orders.filter((o) => o.status === 'fresh' || o.status === 'preparing').length;

  return (
    <WorkerNavbar
      role="cocina"
      badges={{ ordenes: activeOrders }}
      kitchens={kitchens}
      selectedKitchen={selectedKitchen}
      onKitchenChange={onKitchenChange}
      // En el panel de órdenes el nav se colapsa en un botón flotante para dejar más espacio a las cards
      collapsible={pathname === '/cocina'}
    />
  );
};
