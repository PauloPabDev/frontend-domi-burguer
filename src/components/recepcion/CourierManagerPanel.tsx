"use client";

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Bike, Check, Users } from 'lucide-react';
import { useCourierPanel } from '@/contexts/CourierPanelContext';
import { cn } from '@/lib/utils';

export const CourierManagerPanel = () => {
  const { allCouriers, activeCouriers, toggleCourier, isActive, loading, isPanelOpen, closePanel } =
    useCourierPanel();

  // Close on Escape
  useEffect(() => {
    if (!isPanelOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPanelOpen, closePanel]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isPanelOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isPanelOpen]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          isPanelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={closePanel}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col',
          'transition-transform duration-300 ease-in-out',
          isPanelOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary-red/10 flex items-center justify-center">
              <Bike size={16} className="text-primary-red" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-black-80">Domiciliarios</h2>
              <p className="text-xs text-neutral-black-40">Selecciona los que trabajan hoy</p>
            </div>
          </div>
          <button
            onClick={closePanel}
            className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-black-40 hover:text-neutral-black-80"
          >
            <X size={18} />
          </button>
        </div>

        {/* Active summary chip */}
        {activeCouriers.length > 0 && (
          <div className="px-4 py-2.5 shrink-0 border-b border-neutral-100 bg-neutral-50">
            <div className="flex items-center gap-2">
              <Users size={13} className="text-primary-red" />
              <span className="text-xs font-semibold text-neutral-black-60">
                {activeCouriers.length} trabajando hoy
              </span>
              <div className="flex -space-x-1.5 ml-1">
                {activeCouriers.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    className="w-5 h-5 rounded-full bg-primary-red/20 border-2 border-white flex items-center justify-center text-[9px] font-bold text-primary-red shrink-0"
                  >
                    {c.photoURL ? (
                      <img src={c.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      c.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                ))}
                {activeCouriers.length > 5 && (
                  <div className="w-5 h-5 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-neutral-black-50">
                    +{activeCouriers.length - 5}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Courier list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1" style={{ scrollbarWidth: 'thin' }}>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-primary-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : allCouriers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-neutral-black-40">
              <Bike size={32} className="opacity-30" />
              <p className="text-sm text-center">No hay domiciliarios registrados</p>
            </div>
          ) : (
            allCouriers.map((courier) => {
              const active = isActive(courier.id);
              return (
                <button
                  key={courier.id}
                  onClick={() => toggleCourier(courier.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                    active
                      ? 'border-primary-red bg-primary-red/5'
                      : 'border-transparent hover:bg-neutral-50 hover:border-neutral-200',
                  )}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary-red overflow-hidden">
                    {courier.photoURL ? (
                      <img src={courier.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      courier.name?.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-semibold truncate', active ? 'text-neutral-black-80' : 'text-neutral-black-60')}>
                      {courier.name}
                    </p>
                    {courier.phone && (
                      <p className="text-xs text-neutral-black-40 truncate">{courier.phone}</p>
                    )}
                  </div>

                  {/* Toggle indicator */}
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                      active
                        ? 'bg-primary-red border-primary-red'
                        : 'border-neutral-300',
                    )}
                  >
                    {active && <Check size={11} className="text-white" strokeWidth={3} />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-neutral-100 shrink-0">
          <p className="text-xs text-neutral-black-40 text-center">
            La selección se guarda automáticamente en este dispositivo
          </p>
        </div>
      </div>
    </>,
    document.body,
  );
};
