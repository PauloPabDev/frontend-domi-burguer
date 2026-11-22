"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavItem, splitByCapacity } from './navConfig';
import { useDismiss } from './navHooks';
import { NavBadge, NavTarget } from './NavTarget';
import { NavMorePanel } from './NavMorePanel';

interface NavDockProps {
  items: NavItem[];
  navShadow?: string;
  /** Sube el dock para dejar libre el botón flotante del modo colapsado. */
  raised?: boolean;
  /** Accesos que siempre van en el panel «Más» (p. ej. el perfil, cuando no hay navbar arriba). */
  extra?: NavItem[];
  /** Texto del botón del panel. */
  moreLabel?: string;
}

const slotClass = 'flex h-14 max-w-24 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-3xl text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red/50';

/** Dock flotante inferior para móvil: hasta 5 accesos (4 + «Más» si hay más) al alcance del pulgar. */
export const NavDock: React.FC<NavDockProps> = ({ items, navShadow, raised, extra = [], moreLabel = 'Más' }) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const split = splitByCapacity(items, extra.length || items.length > 5 ? Math.min(items.length, 4) : items.length);
  const visible = split.visible;
  const hidden = [...split.hidden, ...extra];
  const hiddenBadges = hidden.reduce((s, i) => s + (i.badge ?? 0), 0);
  const hasActiveHidden = hidden.some((i) => i.isActive);

  useEffect(() => setOpen(false), [pathname]);
  const close = useCallback((viaKeyboard: boolean) => {
    setOpen(false);
    if (viaKeyboard) triggerRef.current?.focus();
  }, []);
  useDismiss(wrapRef, open, close);

  const icon = (active: boolean, Icon: NavItem['Icon'], badge?: number) => (
    <span className={cn('relative flex h-[30px] w-[54px] items-center justify-center rounded-full transition-colors', active ? 'bg-primary-red text-white' : 'text-neutral-black-50')}>
      <Icon className="h-[22px] w-[22px]" />
      <NavBadge count={badge} className="-right-0.5" />
    </span>
  );

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/20" aria-hidden />}
      <div ref={wrapRef}>
        {open && (
          <NavMorePanel
            items={hidden}
            onNavigate={() => setOpen(false)}
            className={cn('fixed left-3 right-3 z-40 max-h-[60dvh] w-auto overflow-y-auto', raised ? 'bottom-[172px]' : 'bottom-[96px]')}
          />
        )}
        <nav
          aria-label="Principal"
          style={{ boxShadow: navShadow, transition: 'box-shadow 0.8s ease-in-out' }}
          className={cn(
            'fixed left-3 right-3 z-40 flex h-[70px] items-center justify-center gap-0.5 rounded-[30px] border border-neutral-black-20 bg-white px-2 shadow-lg',
            raised ? 'bottom-[88px]' : 'bottom-[max(0.75rem,env(safe-area-inset-bottom))]',
          )}
        >
          {visible.map((item) => (
            <NavTarget key={item.key} item={item} className={cn(slotClass, item.isActive ? 'font-extrabold text-primary-red' : 'text-neutral-black-50')}>
              {icon(item.isActive, item.Icon, item.badge)}
              <span className="max-w-full truncate">{item.short ?? item.label}</span>
            </NavTarget>
          ))}
          {hidden.length > 0 && (
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label={hiddenBadges ? `Más accesos, ${hiddenBadges} pendientes` : 'Más accesos'}
              className={cn(slotClass, open || hasActiveHidden ? 'font-extrabold text-primary-red' : 'text-neutral-black-50')}
            >
              {icon(open, LayoutGrid, hiddenBadges)}
              <span className="max-w-full truncate">{moreLabel}</span>
            </button>
          )}
        </nav>
      </div>
    </>
  );
};
