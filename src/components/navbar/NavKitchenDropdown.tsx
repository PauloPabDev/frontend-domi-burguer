"use client";

import { useState, useRef, useEffect } from 'react';
import { ChefHat, ChevronDown, Store } from 'lucide-react';
import { WorkerKitchen } from '@/types/worker';
import { cn } from '@/lib/utils';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';

interface NavKitchenDropdownProps {
  kitchens: WorkerKitchen[];
  selectedKitchen: WorkerKitchen | null;
  onKitchenChange?: (id: string | null) => void;
  /** 'pill' → botón estilo floating nav | 'inline' → botón compacto para sticky header */
  variant?: 'pill' | 'inline';
  /** En variant 'pill': por debajo de lg oculta el nombre de la cocina, dejando solo el ícono (el nombre sigue disponible en la lista desplegable). */
  compact?: boolean;
}

export const NavKitchenDropdown: React.FC<NavKitchenDropdownProps> = ({
  kitchens,
  selectedKitchen,
  onKitchenChange,
  variant = 'pill',
  compact = false,
}) => {
  const { changeKitchen } = useSocket();
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

  const handleSelect = (id: string | null) => {
    onKitchenChange?.(id);
    changeKitchen(id);
    setIsOpen(false);
  };

  if (!kitchens.length) return null;

  return (
    <div ref={containerRef} className="relative">
      {variant === 'pill' ? (
        <Button
          onClick={() => setIsOpen((v) => !v)}
          variant="light-outline"
          size="md"
          leftIcon={<ChefHat className="w-4 h-4 text-primary-red" />}
          className={cn('rounded-full h-10 lg:h-12 shrink-0', compact ? 'px-2.5 lg:px-4' : 'px-4')}
        >
          <span
            className={cn(
              'max-w-[90px] truncate text-xs md:text-sm',
              compact && 'hidden lg:inline',
            )}
          >
            {selectedKitchen?.name ?? 'Cocina'}
          </span>
          <ChevronDown size={13} className="shrink-0" />
        </Button>
      ) : (
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-black-80 hover:text-primary-red transition-colors"
        >
          <Store size={13} className="text-primary-red shrink-0" />
          <span className="max-w-[110px] truncate">
            {selectedKitchen?.name ?? 'Seleccionar cocina'}
          </span>
          <ChevronDown size={12} />
        </button>
      )}

      {isOpen && (
        <div
          className={cn(
            'absolute top-full left-0 bg-white border border-neutral-black-20 shadow-lg z-50',
            variant === 'pill' ? 'mt-2 w-52 rounded-2xl py-1.5' : 'mt-1 w-52 rounded-xl py-1',
          )}
        >
          {variant === 'inline' && (
            <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold text-neutral-black-50 uppercase tracking-wider">
              Cocina de trabajo
            </p>
          )}
          {kitchens.map((k) => (
            <button
              key={k.id}
              onClick={() => handleSelect(k.id)}
              className={cn(
                'w-full text-left transition-colors',
                variant === 'pill'
                  ? 'px-4 py-2.5 text-sm hover:bg-neutral-black-10 rounded-xl'
                  : 'px-3 py-2 text-xs hover:bg-neutral-black-10 flex items-center gap-2',
                selectedKitchen?.id === k.id ? 'font-bold text-primary-red' : 'text-neutral-black-80',
              )}
            >
              {variant === 'inline' && <Store size={12} className="shrink-0" />}
              {k.name}
              {variant === 'inline' && k.location && (
                <span className="ml-auto text-neutral-black-40 text-[10px] truncate max-w-[80px]">
                  {k.location}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
