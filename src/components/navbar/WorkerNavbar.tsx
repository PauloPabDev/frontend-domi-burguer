"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, UserRound, X } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { WorkerKitchen } from '@/types/worker';
import { PaymentRequestsInbox } from '@/components/admin/PaymentRequestsInbox';
import { NAV_CONFIG, NavEntry, NavItem, NavRole } from './navConfig';
import { useNavTier } from './navHooks';
import { useNavShadow } from './useNavShadow';
import { NavPillShell } from './NavPillShell';
import { NavPillLogo } from './NavPillLogo';
import { NavWorkerAvatar } from './NavWorkerAvatar';
import { NavKitchenDropdown } from './NavKitchenDropdown';
import { NavSegment } from './NavSegment';
import { NavDock } from './NavDock';
import { NavBadge } from './NavTarget';

interface WorkerNavbarProps {
  role: NavRole;
  /** Pendientes por `key` de NavEntry (números en 0 se omiten). */
  badges?: Record<string, number | undefined>;
  /** Acciones de las entradas sin `href`, por `key`. */
  actions?: Record<string, () => void>;
  kitchens?: WorkerKitchen[];
  selectedKitchen?: WorkerKitchen | null;
  onKitchenChange?: (id: string | null) => void;
  /** Bandeja de solicitudes de pago (solo admins). */
  showInbox?: boolean;
  /** Pantallas de trabajo continuo: el nav se pliega en un botón flotante. */
  collapsible?: boolean;
  /** En móvil no hay pill arriba (ahorra espacio): el perfil pasa al botón «Más opciones» del dock. */
  dockOnlyOnMobile?: boolean;
}

function isActive(entry: NavEntry, pathname: string) {
  if (!entry.href) return false;
  return entry.exact ? pathname === entry.href : pathname === entry.href || pathname.startsWith(`${entry.href}/`);
}

/**
 * Navbar único de los trabajadores. Cada rol solo aporta su lista de accesos
 * (navConfig) y sus pendientes; este componente decide qué se ve según el ancho:
 * - desde md: pill con segmento de prioridad + panel «Más»
 * - móvil: pill mínimo arriba + dock flotante abajo
 */
export const WorkerNavbar: React.FC<WorkerNavbarProps> = ({
  role,
  badges,
  actions,
  kitchens = [],
  selectedKitchen = null,
  onKitchenChange,
  showInbox = false,
  collapsible = false,
  dockOnlyOnMobile = false,
}) => {
  const { connectionStatus } = useSocket();
  const { user } = useAuth();
  const navShadow = useNavShadow(connectionStatus);
  const pathname = usePathname();
  const tier = useNavTier();
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

  const entries = NAV_CONFIG[role];
  const items: NavItem[] = entries.map((e) => ({
    ...e,
    badge: badges?.[e.key] || undefined,
    isActive: isActive(e, pathname),
    onSelect: actions?.[e.key],
  }));
  const home = entries[0].href!;

  const kitchen = kitchens.length > 0 && (
    <NavKitchenDropdown
      kitchens={kitchens}
      selectedKitchen={selectedKitchen}
      onKitchenChange={onKitchenChange}
      variant="pill"
      compact
      align={tier === 0 ? 'left' : 'right'}
    />
  );
  const inbox = showInbox && <PaymentRequestsInbox kitchens={kitchens} labelClassName="hidden" />;

  // Con la bandeja de solicitudes a la vista, en tablet caben menos accesos sueltos
  const cap = [0, showInbox ? 3 : 4, 5, 5, 6][tier];

  const profile: NavItem = {
    key: 'perfil',
    label: 'Mi perfil',
    Icon: UserRound,
    group: 'Cuenta',
    description: user?.displayName ?? 'Tu cuenta y sesión',
    href: '/profile',
    isActive: pathname.startsWith('/profile'),
  };

  const nav =
    tier === 0 && dockOnlyOnMobile ? (
      <NavDock items={items} navShadow={navShadow} extra={[profile]} moreLabel="Más opciones" />
    ) : tier === 0 ? (
      <>
        <NavPillShell navShadow={navShadow}>
          <div className="flex-1 min-w-0 flex items-center gap-1.5">
            <NavWorkerAvatar compact />
            {kitchen}
          </div>
          <NavPillLogo href={home} />
          <div className="flex-1 min-w-0 flex items-center justify-end gap-1.5">{inbox}</div>
        </NavPillShell>
        <NavDock items={items} navShadow={navShadow} raised={collapsible} />
      </>
    ) : (
      // `relative`: el panel «Más» se ancla a todo el pill, centrado bajo el segmento
      <NavPillShell navShadow={navShadow} innerClassName="relative lg:max-w-none xl:max-w-[1240px] 2xl:max-w-[1320px]">
        <div className="shrink-0">
          <NavPillLogo href={home} />
        </div>
        <div className="flex-1 min-w-0 flex justify-center">
          <NavSegment items={items} cap={cap} labelAll={tier >= 3} wideMore={tier >= 2} />
        </div>
        <div className="shrink-0 flex items-center gap-1.5 lg:gap-2">
          {inbox}
          {kitchen}
          <NavWorkerAvatar compact />
        </div>
      </NavPillShell>
    );

  if (!collapsible) return nav;

  const pending = items.reduce((s, i) => s + (i.badge ?? 0), 0);
  return (
    <div ref={containerRef}>
      {open && nav}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Ocultar menú' : 'Mostrar menú'}
        aria-expanded={open}
        style={{ boxShadow: navShadow, transition: 'box-shadow 0.8s ease-in-out' }}
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-white border border-neutral-black-20 shadow-lg flex items-center justify-center text-neutral-black-80 cursor-pointer"
      >
        {open ? <X size={24} className="pointer-events-none" /> : <Menu size={24} className="pointer-events-none" />}
        {!open && <NavBadge count={pending} />}
      </button>
    </div>
  );
};
