"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ElementType } from 'react';
import { ClipboardList, Map, PlusCircle, Bike, BarChart3, IdCard } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { WorkerKitchen } from '@/types/worker';
import { Button } from '@/components/ui/button';
import { useNavShadow } from '@/components/navbar/useNavShadow';
import { NavWorkerAvatar } from '@/components/navbar/NavWorkerAvatar';
import { NavPillShell } from '@/components/navbar/NavPillShell';
import { NavPillLogo } from '@/components/navbar/NavPillLogo';
import { NavKitchenDropdown } from '@/components/navbar/NavKitchenDropdown';
import { useCourierPanel } from '@/contexts/CourierPanelContext';

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

  const activeOrders = orders.filter(
    (o) => o.status === 'fresh' || o.status === 'preparing' || o.status === 'ready_for_pickup',
  );

  // Con 6 accesos no entran con texto dentro de la pill (máx 828px), así que
  // van solo con ícono + tooltip (title). Si aun así no caben en una pantalla
  // muy angosta, la fila hace scroll horizontal en vez de recortarse.
  const navItems: NavItem[] = [
    {
      key: 'pedidos',
      label: 'Pedidos',
      Icon: ClipboardList,
      href: '/recepcion',
      badge: activeOrders.length > 0 ? activeOrders.length : undefined,
    },
    { key: 'crear', label: 'Crear pedido', Icon: PlusCircle, href: '/recepcion/nueva-orden' },
    { key: 'cliente', label: 'Cliente', Icon: IdCard, href: '/recepcion/cliente' },
    { key: 'mapa', label: 'Mapa', Icon: Map, href: '/recepcion/mapa' },
    { key: 'contabilidad', label: 'Contabilidad', Icon: BarChart3, href: '/recepcion/contabilidad' },
    {
      key: 'motos',
      label: 'Motos',
      Icon: Bike,
      onClick: openPanel,
      badge: activeCouriers.length > 0 ? activeCouriers.length : undefined,
    },
  ];

  const renderNavButton = (item: NavItem) => {
    const isActive = item.href ? pathname === item.href : false;
    const button = (
      <Button
        variant={isActive ? 'primary' : 'light-outline'}
        size="md"
        leftIcon={<item.Icon className="w-4 h-4 lg:w-5 lg:h-5" />}
        badge={item.badge}
        onClick={item.onClick}
        title={item.label}
        aria-label={item.label}
        className="h-10 lg:h-12 px-3 shrink-0"
      />
    );

    return item.href ? (
      <Link key={item.key} href={item.href} tabIndex={-1} className="focus:outline-0! focus:ring-0! rounded-full shrink-0">
        {button}
      </Link>
    ) : (
      <span key={item.key} className="shrink-0">
        {button}
      </span>
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

      {/* Right: accesos en ícono; si no caben, la fila scrollea en vez de recortarse */}
      <div className="flex-1 min-w-0 flex items-center justify-end gap-1.5 lg:gap-2 overflow-x-auto scrollbar-hide">
        {navItems.map(renderNavButton)}
      </div>
    </NavPillShell>
  );
};
