"use client";

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { NavItem } from './navConfig';
import { NavTarget } from './NavTarget';

interface NavMorePanelProps {
  items: NavItem[];
  /** 2 columnas cuando hay muchos accesos y espacio. */
  cols?: 1 | 2;
  className?: string;
  onNavigate: () => void;
}

/** Panel «Más»: accesos agrupados por sección, con ícono, nombre y descripción. */
export const NavMorePanel: React.FC<NavMorePanelProps> = ({ items, cols = 1, className, onNavigate }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[role=menuitem]')?.focus();
  }, []);

  const groups = new Map<string, NavItem[]>();
  items.forEach((i) => groups.set(i.group, [...(groups.get(i.group) ?? []), i]));

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const els = [...e.currentTarget.querySelectorAll<HTMLElement>('[role=menuitem]')];
    const next = els.indexOf(document.activeElement as HTMLElement) + (e.key === 'ArrowDown' ? 1 : -1);
    els[(next + els.length) % els.length]?.focus();
  };

  return (
    <div
      ref={ref}
      role="menu"
      onKeyDown={onKeyDown}
      className={cn(
        'z-50 rounded-3xl border border-neutral-black-20 bg-white p-3 shadow-xl',
        cols === 2 ? 'w-[35rem]' : 'w-[22rem]',
        className,
      )}
    >
      {[...groups].map(([group, list]) => (
        <div key={group} className="mb-1.5 last:mb-0">
          <p className="px-2.5 pb-1.5 pt-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-neutral-black-50">
            {group}
          </p>
          <div className={cn('grid gap-0.5', cols === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
            {list.map((item) => (
              <NavTarget
                key={item.key}
                item={item}
                role="menuitem"
                onNavigate={onNavigate}
                className={cn(
                  'flex min-w-0 items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red/50',
                  item.isActive ? 'bg-primary-red/10' : 'hover:bg-neutral-black-3',
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    item.isActive ? 'bg-primary-red text-white' : 'bg-neutral-black-3 text-neutral-black-80',
                  )}
                >
                  <item.Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className="truncate text-sm font-bold leading-tight text-neutral-black-80">{item.label}</span>
                  <span className="truncate text-xs leading-tight text-neutral-black-50">{item.description}</span>
                </span>
                {item.badge ? (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-accent-yellow-20 px-1.5 text-xs font-bold text-neutral-black-80">
                    {item.badge}
                  </span>
                ) : null}
                {item.action && (
                  <span className="rounded-full border border-neutral-black-20 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-neutral-black-50">
                    panel
                  </span>
                )}
              </NavTarget>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
