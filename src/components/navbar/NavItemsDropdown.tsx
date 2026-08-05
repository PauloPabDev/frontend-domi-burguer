"use client";

import { useState, useRef, useEffect, ElementType } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu as MenuIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface NavDropdownItem {
  key: string;
  label: string;
  Icon: ElementType;
  href?: string;
  onClick?: () => void;
  badge?: number;
  isActive?: boolean;
}

interface NavItemsDropdownProps {
  items: NavDropdownItem[];
  /** Ícono a mostrar cuando ninguno de los items está activo. */
  fallbackIcon?: ElementType;
  className?: string;
}

/**
 * Botón tipo "select" que agrupa varios accesos del nav dentro de un panel
 * desplegable — se usa para ahorrar espacio en mobile/tablet. El botón
 * cerrado muestra el ícono del item activo (si hay uno entre los agrupados)
 * y la suma de sus badges, para no perder visibilidad de pendientes.
 */
export const NavItemsDropdown: React.FC<NavItemsDropdownProps> = ({
  items,
  fallbackIcon: FallbackIcon = MenuIcon,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!items.length) return null;

  const activeItem = items.find((i) => i.isActive);
  const totalBadge = items.reduce((sum, i) => sum + (i.badge ?? 0), 0);
  const TriggerIcon = activeItem?.Icon ?? FallbackIcon;
  const triggerLabel = activeItem?.label ?? 'Menú';

  return (
    <div ref={containerRef} className={cn('relative shrink-0', className)}>
      <Button
        variant={activeItem ? 'primary' : 'light-outline'}
        size="md"
        leftIcon={<TriggerIcon className="w-4 h-4 xl:w-5 xl:h-5" />}
        rightIcon={<ChevronDown size={13} />}
        badge={totalBadge > 0 ? totalBadge : undefined}
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={triggerLabel}
        aria-label={triggerLabel}
        className="h-10 lg:h-12 px-3 xl:pl-4 xl:pr-3 text-sm shrink-0"
      >
        <span className="hidden xl:inline">{triggerLabel}</span>
      </Button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full right-0 mt-2 w-52 rounded-2xl border border-neutral-black-20 bg-white py-1.5 shadow-lg z-50"
        >
          {items.map((item) => {
            const itemClassName = cn(
              'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm rounded-xl transition-colors',
              item.isActive
                ? 'font-bold text-primary-red bg-primary-red/5'
                : 'text-neutral-black-80 hover:bg-neutral-black-10',
            );
            const content = (
              <>
                <item.Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="flex items-center justify-center min-w-[1.375rem] h-5 px-1 rounded-full text-xs font-bold bg-accent-yellow-10 text-neutral-black-80">
                    {item.badge}
                  </span>
                )}
              </>
            );

            return item.href ? (
              <Link key={item.key} href={item.href} className={itemClassName} onClick={() => setIsOpen(false)}>
                {content}
              </Link>
            ) : (
              <button
                key={item.key}
                type="button"
                className={itemClassName}
                onClick={() => {
                  setIsOpen(false);
                  item.onClick?.();
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
