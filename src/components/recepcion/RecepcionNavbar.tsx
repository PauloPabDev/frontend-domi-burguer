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
import { NavItemsDropdown } from '@/components/navbar/NavItemsDropdown';
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

  // Estrategia responsiva de 3 niveles para no quedarse sin espacio:
  // - Mobile (< md): los 6 accesos se agrupan en un solo botón tipo
  //   "select" (NavItemsDropdown) que abre un panel con la lista completa.
  // - Medio (md–lg): se muestra la primera mitad de los accesos como
  //   botones sueltos y el resto se agrupa en el mismo dropdown, así se
  //   gana espacio sin perder acceso directo a lo más usado.
  // - Grande (>= lg): Pedidos, Crear pedido, Mapa y Contabilidad quedan
  //   sueltos; Cliente y Motos (domicilios) se agrupan en el mismo
  //   dropdown por ser accesos secundarios. El nombre completo (p. ej.
  //   "CONTABILIDAD") solo entra cómodo desde xl — a partir de lg la pill
  //   ya no tiene tope de ancho (ver innerClassName="lg:max-w-none" abajo),
  //   pero entre lg y xl sigue sin espacio de sobra, así que por debajo de
  //   xl se muestra solo el ícono (con tooltip). Como resguardo final, si
  //   aun así no caben en una pantalla muy angosta, la fila hace scroll
  //   horizontal en vez de recortarse.
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

  // Activo tanto en el href exacto como en sus subrutas (p. ej.
  // /recepcion/contabilidad/pedido/123 mantiene resaltado "Contabilidad").
  const isItemActive = (item: NavItem) => {
    if (!item.href) return false;
    if (item.href === '/recepcion') return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  // Mitad de accesos visible como botones sueltos en pantallas medianas;
  // el resto se agrupa en el dropdown (ver bloque "Right" más abajo).
  const half = Math.ceil(navItems.length / 2);
  const primaryNavItems = navItems.slice(0, half);
  const secondaryNavItems = navItems.slice(half);
  const toDropdownItem = (item: NavItem) => ({ ...item, isActive: isItemActive(item) });

  // En pantallas grandes, Cliente y Motos (domicilios) se agrupan en el
  // select por ser accesos secundarios; el resto queda suelto.
  const LARGE_SELECT_KEYS = new Set(['cliente', 'motos']);
  const largeDirectItems = navItems.filter((item) => !LARGE_SELECT_KEYS.has(item.key));
  const largeSelectItems = navItems.filter((item) => LARGE_SELECT_KEYS.has(item.key));

  const renderNavButton = (item: NavItem) => {
    const isActive = isItemActive(item);
    const button = (
      <Button
        variant={isActive ? 'primary' : 'light-outline'}
        size="md"
        leftIcon={<item.Icon className="w-4 h-4 xl:w-5 xl:h-5" />}
        badge={item.badge}
        onClick={item.onClick}
        title={item.label}
        aria-label={item.label}
        className="h-10 lg:h-12 px-3 xl:pl-4 xl:pr-3 text-sm shrink-0"
      >
        <span className="hidden xl:inline">{item.label}</span>
      </Button>
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

      {/* Right: mobile → todo en el dropdown; medio → mitad suelta + dropdown; grande → suelto salvo Cliente/Motos */}
      <div className="flex-1 min-w-0 flex items-center justify-end gap-1.5 lg:gap-2">
        <div className="flex md:hidden">
          <NavItemsDropdown items={navItems.map(toDropdownItem)} />
        </div>

        <div className="hidden md:flex lg:hidden items-center gap-1.5">
          {primaryNavItems.map(renderNavButton)}
          <NavItemsDropdown items={secondaryNavItems.map(toDropdownItem)} />
        </div>

        <div className="hidden lg:flex items-center gap-1.5 lg:gap-2 overflow-x-auto scrollbar-hide">
          {largeDirectItems.map(renderNavButton)}
          <NavItemsDropdown items={largeSelectItems.map(toDropdownItem)} />
        </div>
      </div>
    </NavPillShell>
  );
};
