"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavItem, splitByCapacity } from './navConfig';
import { useDismiss } from './navHooks';
import { NavBadge, NavTarget } from './NavTarget';
import { NavMorePanel } from './NavMorePanel';

interface NavSegmentProps {
  items: NavItem[];
  /** Cuántos accesos caben sueltos en la barra; el resto va a «Más». */
  cap: number;
  /** Desde xl todos llevan nombre; antes, solo el activo. */
  labelAll: boolean;
  wideMore: boolean;
}

const itemClass = 'relative inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-full px-3 text-[13.5px] font-bold tracking-[0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red/50';

/**
 * Accesos del nav desde tablet: un segmento donde el activo muestra su nombre y
 * los demás solo ícono (con tooltip). Lo que no cabe va al panel «Más», que se
 * ancla al pill (el padre debe ser `relative`) y no a este botón.
 */
export const NavSegment: React.FC<NavSegmentProps> = ({ items, cap, labelAll, wideMore }) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { visible, hidden } = splitByCapacity(items, cap);
  const showLabels = labelAll || visible.length <= 3;
  const hiddenBadges = hidden.reduce((s, i) => s + (i.badge ?? 0), 0);

  useEffect(() => setOpen(false), [pathname]);
  const close = useCallback((viaKeyboard: boolean) => {
    setOpen(false);
    if (viaKeyboard) triggerRef.current?.focus();
  }, []);
  useDismiss(wrapRef, open, close);

  return (
    <div ref={wrapRef}>
      <nav aria-label="Principal" className="flex items-center gap-0.5 rounded-full border border-neutral-black-10 bg-neutral-black-3 p-1">
        {visible.map((item) => (
          <NavTarget
            key={item.key}
            item={item}
            className={cn(itemClass, item.isActive ? 'bg-primary-red text-white shadow-sm' : 'text-neutral-black-80 hover:bg-white')}
          >
            <item.Icon className="h-5 w-5 shrink-0" />
            {(showLabels || item.isActive) && <span className="uppercase">{item.label}</span>}
            <NavBadge count={item.badge} />
          </NavTarget>
        ))}
        {hidden.length > 0 && (
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            title="Más accesos"
            aria-label={hiddenBadges ? `Más accesos, ${hiddenBadges} pendientes` : 'Más accesos'}
            className={cn(itemClass, 'text-neutral-black-80 hover:bg-white', open && 'bg-white ring-[1.5px] ring-neutral-black-20')}
          >
            <LayoutGrid className="h-5 w-5 shrink-0" />
            {showLabels && <span>MÁS</span>}
            <ChevronDown size={13} className="shrink-0" />
            <NavBadge count={hiddenBadges} />
          </button>
        )}
      </nav>
      {open && (
        <NavMorePanel
          items={hidden}
          cols={wideMore && hidden.length > 4 ? 2 : 1}
          onNavigate={() => setOpen(false)}
          className="absolute left-1/2 top-[calc(100%+10px)] -translate-x-1/2"
        />
      )}
    </div>
  );
};
