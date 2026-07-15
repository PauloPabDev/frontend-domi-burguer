"use client";

import { Bike, Filter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WorkerKitchen } from '@/types/worker';
import { formatLocalDateTime } from '../utils';

interface QuickFilter {
  label: string;
  start: Date;
  end: Date;
}

interface FilterPanelProps {
  kitchens: WorkerKitchen[];
  selectedKitchenId: string | null;
  onSelectKitchen: (id: string | null) => void;
  startDate: Date;
  endDate: Date;
  onStartDateChange: (d: Date) => void;
  onEndDateChange: (d: Date) => void;
  loading: boolean;
  onFetch: () => void;
  quickFilters: QuickFilter[];
  onQuickFilter: (start: Date, end: Date) => void;
  search: string;
  onSearchChange: (s: string) => void;
  couriers: Array<{ id: string; name: string }>;
  selectedCourier: string;
  onCourierChange: (id: string) => void;
  onClearFilters: () => void;
}

export function FilterPanel({
  kitchens, selectedKitchenId, onSelectKitchen,
  startDate, endDate, onStartDateChange, onEndDateChange,
  loading, onFetch,
  quickFilters, onQuickFilter,
  search, onSearchChange,
  couriers, selectedCourier, onCourierChange,
  onClearFilters,
}: FilterPanelProps) {
  const hasActiveFilters = search || selectedCourier;

  return (
    <div className="rounded-2xl border border-neutral-black-20 bg-white p-4 space-y-3">
      {/* Cocina */}
      <div>
        <label className="block text-xs font-semibold text-neutral-black-50 mb-1">Cocina</label>
        <select
          value={selectedKitchenId ?? ''}
          onChange={(e) => onSelectKitchen(e.target.value || null)}
          className="w-full h-10 rounded-full border-[1.5px] border-neutral-black-20 px-4 text-sm text-neutral-black-80 bg-transparent focus:outline-none focus:border-neutral-black-50"
        >
          <option value="">Selecciona una cocina…</option>
          {kitchens.map((k) => (
            <option key={k.id} value={k.id}>{k.name}</option>
          ))}
        </select>
      </div>

      {/* Rango de fechas */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-neutral-black-50 mb-1">Desde</label>
          <input
            type="datetime-local"
            value={formatLocalDateTime(startDate)}
            onChange={(e) => onStartDateChange(new Date(e.target.value))}
            className="w-full h-10 rounded-full border-[1.5px] border-neutral-black-20 px-4 text-sm text-neutral-black-80 focus:outline-none focus:border-neutral-black-50 bg-transparent"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-neutral-black-50 mb-1">Hasta</label>
          <input
            type="datetime-local"
            value={formatLocalDateTime(endDate)}
            onChange={(e) => onEndDateChange(new Date(e.target.value))}
            className="w-full h-10 rounded-full border-[1.5px] border-neutral-black-20 px-4 text-sm text-neutral-black-80 focus:outline-none focus:border-neutral-black-50 bg-transparent"
          />
        </div>
        <div className="flex items-end">
          <Button
            variant="primary"
            size="md"
            onClick={onFetch}
            disabled={!selectedKitchenId}
            loading={loading}
            loadingText="Buscando..."
            leftIcon={<Search size={16} />}
            className="w-full sm:w-auto"
          >
            Buscar
          </Button>
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((f) => (
          <button
            key={f.label}
            onClick={() => onQuickFilter(f.start, f.end)}
            disabled={loading || !selectedKitchenId}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-neutral-black-20 text-neutral-black-50 hover:bg-neutral-black-10 hover:text-neutral-black-80 transition-colors disabled:opacity-50"
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Búsqueda + filtro domiciliario */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-black-50 pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar por cliente, teléfono o número…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-black-50 hover:text-neutral-black-80"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {couriers.length > 0 && (
          <select
            value={selectedCourier}
            onChange={(e) => onCourierChange(e.target.value)}
            className="h-10 rounded-full border-[1.5px] border-neutral-black-20 px-4 text-sm text-neutral-black-80 bg-transparent focus:outline-none focus:border-neutral-black-50 min-w-[180px]"
          >
            <option value="">Todos los domiciliarios</option>
            {couriers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-neutral-black-50">
            <Filter size={12} />
            Filtros activos:
          </span>
          {search && (
            <span className="text-xs font-medium bg-neutral-black-10 text-neutral-black-80 rounded-full px-2.5 py-0.5 flex items-center gap-1">
              "{search}"
              <button onClick={() => onSearchChange('')}><X size={11} /></button>
            </span>
          )}
          {selectedCourier && (
            <span className="text-xs font-medium bg-neutral-black-10 text-neutral-black-80 rounded-full px-2.5 py-0.5 flex items-center gap-1">
              <Bike size={11} />
              {couriers.find((c) => c.id === selectedCourier)?.name}
              <button onClick={() => onCourierChange('')}><X size={11} /></button>
            </span>
          )}
          <button onClick={onClearFilters} className="text-xs text-primary-red font-semibold hover:underline ml-1">
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
}
