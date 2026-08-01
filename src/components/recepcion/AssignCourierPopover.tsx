"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Bike, Settings, UserX } from 'lucide-react';
import { WorkerUser } from '@/types/worker';
import { useCourierPanel } from '@/contexts/CourierPanelContext';
import { cn } from '@/lib/utils';

const POPOVER_WIDTH = 260;
const GAP = 6;

interface AssignCourierPopoverProps {
  anchorRef: RefObject<HTMLElement | null>;
  currentCourierId?: string;
  onAssign: (courierId: string | null) => Promise<void>;
  onClose: () => void;
}

export const AssignCourierPopover: React.FC<AssignCourierPopoverProps> = ({
  anchorRef,
  currentCourierId,
  onAssign,
  onClose,
}) => {
  const { activeCouriers, allCouriers, filterCourierIds, openPanel } = useCourierPanel();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    left: number;
    anchor: 'top' | 'bottom';
    offset: number;
    maxHeight: number;
  } | null>(null);

  // Use active couriers if any, fall back to all couriers
  const baseCouriers: WorkerUser[] = activeCouriers.length > 0 ? activeCouriers : allCouriers;
  const usingFallback = activeCouriers.length === 0 && allCouriers.length > 0;

  // Apply panel filter if active
  const couriers: WorkerUser[] =
    filterCourierIds.size > 0
      ? baseCouriers.filter((c) => filterCourierIds.has(c.id))
      : baseCouriers;

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < 260 && spaceAbove > spaceBelow;

    const left = Math.min(Math.max(rect.left, GAP), window.innerWidth - POPOVER_WIDTH - GAP);

    setPosition({
      left,
      anchor: openUp ? 'bottom' : 'top',
      offset: openUp ? window.innerHeight - rect.top + GAP : rect.bottom + GAP,
      maxHeight: Math.max(160, (openUp ? spaceAbove : spaceBelow) - GAP * 2),
    });
  }, [anchorRef]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleReposition = () => onClose();

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [anchorRef, onClose]);

  const handleSelect = (courierId: string | null) => {
    onClose();
    onAssign(courierId).catch(() => {});
  };

  const handleOpenPanel = () => {
    onClose();
    openPanel();
  };

  if (!position) return null;

  return createPortal(
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        left: position.left,
        width: POPOVER_WIDTH,
        maxHeight: position.maxHeight + 88,
        [position.anchor]: position.offset,
      }}
      className="z-50 bg-white rounded-xl shadow-lg border border-neutral-black-10 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-black-10 shrink-0">
        <Bike size={14} className="text-primary-red" />
        <h3 className="font-bold text-xs text-neutral-black-80">Asignar domiciliario</h3>
        {activeCouriers.length > 0 && (
          <span className="ml-auto text-[10px] font-semibold bg-primary-red/10 text-primary-red px-1.5 py-0.5 rounded-full shrink-0">
            {filterCourierIds.size > 0 ? `${couriers.length} filtrados` : `${activeCouriers.length} activos`}
          </span>
        )}
      </div>

      {/* Fallback notice */}
      {usingFallback && (
        <div className="mx-2 mt-2 px-2 py-1.5 rounded-lg bg-amber-50 border border-amber-200 shrink-0">
          <span className="text-[11px] text-amber-700">
            No hay domiciliarios activos hoy. Mostrando todos.
          </span>
        </div>
      )}

      {/* Courier list */}
      <div className="overflow-y-auto p-1.5 space-y-0.5" style={{ maxHeight: position.maxHeight }}>
        <button
          onClick={() => handleSelect(null)}
          className="w-full flex items-center gap-2 p-2 rounded-lg border border-transparent hover:bg-neutral-black-10 transition-colors text-left"
        >
          <div className="w-7 h-7 rounded-full bg-neutral-black-10 flex items-center justify-center shrink-0">
            <UserX size={13} className="text-neutral-black-40" />
          </div>
          <p className="text-xs font-semibold text-neutral-black-60">Sin asignar</p>
        </button>

        {couriers.length === 0 ? (
          <p className="text-xs text-center text-neutral-black-50 py-4">No hay domiciliarios disponibles</p>
        ) : (
          couriers.map((courier) => (
            <button
              key={courier.id}
              onClick={() => handleSelect(courier.id)}
              className={cn(
                'w-full flex items-center gap-2 p-2 rounded-lg border border-transparent hover:bg-neutral-black-10 transition-colors text-left',
                currentCourierId === courier.id && 'bg-neutral-black-10',
              )}
            >
              <div className="w-7 h-7 rounded-full bg-primary-red/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary-red overflow-hidden">
                {courier.photoURL ? (
                  <img src={courier.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  courier.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-black-80 truncate">{courier.name}</p>
              </div>
              {currentCourierId === courier.id && (
                <div className="w-3 h-3 rounded-full bg-primary-red shrink-0" />
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-2 py-1.5 border-t border-neutral-black-10 shrink-0">
        <button
          onClick={handleOpenPanel}
          className="w-full flex items-center justify-center gap-1.5 text-[11px] text-neutral-black-40 hover:text-neutral-black-60 transition-colors py-1"
        >
          <Settings size={11} />
          Gestionar domiciliarios activos
        </button>
      </div>
    </div>,
    document.body,
  );
};
