"use client";

import { usePathname } from 'next/navigation';
import { ElementType } from 'react';
import { ClipboardList, Map, PlusCircle, Bike, BarChart3, IdCard, BookOpen } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { WorkerKitchen } from '@/types/worker';
import { useNavShadow } from '@/components/navbar/useNavShadow';
import { NavWorkerAvatar } from '@/components/navbar/NavWorkerAvatar';
import { NavPillShell } from '@/components/navbar/NavPillShell';
import { NavPillLogo } from '@/components/navbar/NavPillLogo';
import { NavKitchenDropdown } from '@/components/navbar/NavKitchenDropdown';
import { NavItemsDropdown } from '@/components/navbar/NavItemsDropdown';
import { NavPillItem } from '@/components/navbar/NavPillItem';
import { useCourierPanel } from '@/contexts/CourierPanelContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { PaymentRequestsInbox } from '@/components/admin/PaymentRequestsInbox';

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
  const { userProfile } = useUserProfile();
  // Las solicitudes de cambio de pago de recepción solo las resuelve un admin
  const isAdmin = userProfile?.roles?.includes('admin') ?? false;
  const pathname = usePathname();
  const navShadow = useNavShadow(connectionStatus);

  const activeOrders = orders.filter(
    (o) => o.status === 'fresh' || o.status === 'preparing' || o.status === 'ready_for_pickup',
  );

  // Estrategia responsiva:
  // - Mobile (< md): todos los accesos se agrupan en un solo botón tipo
  //   "select" (NavItemsDropdown) que abre un panel con la lista completa.
  // - Desde md: Pedidos, Crear pedido, Mapa y Contabilidad quedan sueltos;
  //   Cliente, Documentos y Motos se agrupan en el dropdown por ser accesos
  //   secundarios. El logo va centrado con dos columnas flex-1, así que cada
  //   lado solo dispone de la mitad del ancho: los nombres completos recién
  //   entran desde 2xl; por debajo los botones muestran solo el ícono
  //   (con tooltip).
  // Ningún contenedor del nav puede llevar overflow (auto/hidden): recortaría
  // el panel absoluto de los dropdowns y en PC no se podría hacer clic en él.
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
    { key: 'documentos', label: 'Documentos', Icon: BookOpen, href: '/recepcion/documentos' },
    {
      key: 'motos',
      label: 'Motos',
      Icon: Bike,
      onClick: openPanel,
      badge: activeCouriers.length > 0 ? activeCouriers.length : undefined,
    },
  ];

  // Activo tanto en el href exacto como en sus subrutas (p. ej.
  // /recepcion/contabilidad/pedido/123 mantiene resaltado "Contabilidad").
  const isItemActive = (item: NavItem) => {
    if (!item.href) return false;
    if (item.href === '/recepcion') return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const toDropdownItem = (item: NavItem) => ({ ...item, isActive: isItemActive(item) });

  const SECONDARY_KEYS = new Set(['cliente', 'documentos', 'motos']);
  const directItems = navItems.filter((item) => !SECONDARY_KEYS.has(item.key));
  const secondaryItems = navItems.filter((item) => SECONDARY_KEYS.has(item.key));

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

      {/* Right: mobile → todo en el dropdown; desde md → accesos principales sueltos + dropdown con los secundarios */}
      <div className="flex-1 min-w-0 flex items-center justify-end gap-1.5 lg:gap-2">
        {isAdmin && <PaymentRequestsInbox kitchens={kitchens} labelClassName="hidden 2xl:inline" />}
        <div className="flex md:hidden">
          <NavItemsDropdown items={navItems.map(toDropdownItem)} />
        </div>

        <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {directItems.map((item) => (
            <NavPillItem
              key={item.key}
              label={item.label}
              Icon={item.Icon}
              href={item.href}
              onClick={item.onClick}
              badge={item.badge}
              isActive={isItemActive(item)}
              labelClassName="hidden 2xl:inline"
            />
          ))}
          <NavItemsDropdown items={secondaryItems.map(toDropdownItem)} />
        </div>
      </div>
    </NavPillShell>
  );
};
