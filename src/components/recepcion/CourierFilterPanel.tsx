"use client";

import { useState } from 'react';
import { Bike, ChevronDown, X } from 'lucide-react';
import { useCourierPanel } from '@/contexts/CourierPanelContext';
import { cn } from '@/lib/utils';

interface CourierFilterPanelProps {
  className?: string;
}

export const CourierFilterPanel: React.FC<CourierFilterPanelProps> = ({ className }) => {
  const { allCouriers, filterCourierIds, toggleFilterCourier, clearCourierFilter, loading } =
    useCourierPanel();
  const [isOpen, setIsOpen] = useState(true);

  if (loading || allCouriers.length === 0) return null;

  const hasFilter = filterCourierIds.size > 0;

  return (
    <div className={cn('shrink-0', className)}>
      {/* Header row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-black-60 hover:text-neutral-black-80 transition-colors"
        >
          <Bike size={13} className="text-primary-red" />
          <span>Domiciliarios</span>
          {hasFilter && (
            <span className="bg-primary-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {filterCourierIds.size}
            </span>
          )}
          <ChevronDown
            size={13}
            className={cn('transition-transform duration-200', isOpen ? 'rotate-180' : '')}
          />
        </button>

        {hasFilter && (
          <button
            type="button"
            onClick={clearCourierFilter}
            className="flex items-center gap-0.5 text-[10px] text-neutral-black-40 hover:text-primary-red transition-colors"
          >
            <X size={10} strokeWidth={2.5} />
            Limpiar
          </button>
        )}
      </div>

      {/* Chips — animación por max-height */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          isOpen ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0 pointer-events-none',
        )}
      >
        <div className="flex gap-1.5 flex-wrap">
          {/* Chip "Todos" */}
          <button
            type="button"
            onClick={clearCourierFilter}
            className={cn(
              'text-xs font-semibold px-2.5 py-1 rounded-full border transition-all',
              !hasFilter
                ? 'bg-neutral-black-80 text-white border-transparent'
                : 'bg-white text-neutral-black-40 border-neutral-black-20 hover:border-neutral-black-40',
            )}
          >
            Todos
          </button>

          {allCouriers.map((courier) => {
            const active = filterCourierIds.has(courier.id);
            return (
              <button
                key={courier.id}
                type="button"
                onClick={() => toggleFilterCourier(courier.id)}
                className={cn(
                  'flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all',
                  active
                    ? 'bg-primary-red text-white border-transparent'
                    : 'bg-white text-neutral-black-60 border-neutral-black-20 hover:border-neutral-black-40',
                )}
              >
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold overflow-hidden shrink-0 bg-primary-red/20 text-primary-red">
                  {courier.photoURL ? (
                    <img src={courier.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    courier.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="max-w-[90px] truncate">
                  {courier.name?.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
