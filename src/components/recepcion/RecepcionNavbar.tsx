"use client";

import { useSocket } from '@/contexts/SocketContext';
import { WorkerKitchen } from '@/types/worker';
import { WorkerNavbar } from '@/components/navbar/WorkerNavbar';
import { useCourierPanel } from '@/contexts/CourierPanelContext';
import { useUserProfile } from '@/hooks/useUserProfile';

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
  const { orders } = useSocket();
  const { activeCouriers, openPanel } = useCourierPanel();
  const { userProfile } = useUserProfile();
  // Las solicitudes de cambio de pago de recepción solo las resuelve un admin
  const isAdmin = userProfile?.roles?.includes('admin') ?? false;

  const activeOrders = orders.filter(
    (o) => o.status === 'fresh' || o.status === 'preparing' || o.status === 'ready_for_pickup',
  ).length;

  return (
    <WorkerNavbar
      role="recepcion"
      badges={{ pedidos: activeOrders, motos: activeCouriers.length }}
      actions={{ motos: openPanel }}
      kitchens={kitchens}
      selectedKitchen={selectedKitchen}
      onKitchenChange={onKitchenChange}
      showInbox={isAdmin}
    />
  );
};
