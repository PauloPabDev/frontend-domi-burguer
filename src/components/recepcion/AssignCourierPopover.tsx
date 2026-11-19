"use client";

import type { RefObject } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Bike, Settings, UserX } from 'lucide-react';
import { WorkerUser } from '@/types/worker';
import { useCourierPanel } from '@/contexts/CourierPanelContext';
import { cn } from '@/lib/utils';

// Radio concéntrico: filas rounded-lg (8px) + padding de la lista (8px) = contenedor rounded-2xl (16px)

interface AssignCourierPopoverProps {
  anchorRef: RefObject<HTMLElement | null>;
  currentCourierId?: string;
  onAssign: (courierId: string | null) => Promise<void>;
  onClose: () => void;
}

/**
 * Popover de Radix: se apila bien dentro de los modales (también Radix), cierra con Esc
 * solo él mismo y mantiene su posición al hacer scroll. z-[600] por encima de los modales (500).
 */
export const AssignCourierPopover: React.FC<AssignCourierPopoverProps> = ({
  anchorRef,
  currentCourierId,
  onAssign,
  onClose,
}) => {
  const { activeCouriers, allCouriers, filterCourierIds, openPanel } = useCourierPanel();

  // Use active couriers if any, fall back to all couriers
  const baseCouriers: WorkerUser[] = activeCouriers.length > 0 ? activeCouriers : allCouriers;
  const usingFallback = activeCouriers.length === 0 && allCouriers.length > 0;

  // Apply panel filter if active
  const couriers: WorkerUser[] =
    filterCourierIds.size > 0
      ? baseCouriers.filter((c) => filterCourierIds.has(c.id))
      : baseCouriers;

  const handleSelect = (courierId: string | null) => {
    onClose();
    onAssign(courierId).catch(() => {});
  };

  const handleOpenPanel = () => {
    onClose();
    openPanel();
  };

  return (
    <Popover.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Popover.Anchor virtualRef={anchorRef as RefObject<HTMLElement>} />
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={6}
          onOpenAutoFocus={(e) => e.preventDefault()}
          // Tocar el botón que lo abrió no cuenta como "fuera": ese botón alterna el popover
          onInteractOutside={(e) => {
            if (e.target instanceof Node && anchorRef.current?.contains(e.target)) e.preventDefault();
          }}
          className="z-[600] w-[260px] max-w-[calc(100vw-12px)] max-h-[min(var(--radix-popover-content-available-height),420px)] bg-white rounded-2xl shadow-lg border border-neutral-black-10 overflow-hidden flex flex-col"
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
          <div className="overflow-y-auto min-h-0 p-2 space-y-0.5">
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
          <div className="p-2 border-t border-neutral-black-10 shrink-0">
            <button
              onClick={handleOpenPanel}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg text-[11px] text-neutral-black-40 hover:bg-neutral-black-5 hover:text-neutral-black-60 transition-colors py-1.5"
            >
              <Settings size={11} />
              Gestionar domiciliarios activos
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
