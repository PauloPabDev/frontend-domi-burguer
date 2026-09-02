"use client";

import { Filter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WorkerKitchen, STATUS_CONFIG } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { formatLocalDateTime } from '@/lib/dates';
import { cn } from '@/lib/utils';

interface QuickFilter {
  label: string;
  start: Date;
  end: Date;
}

const STATUS_FILTERS: OrderStatus[] = [
  'fresh', 'preparing', 'ready_for_pickup', 'dispatched',
  'delivered', 'pending_payment', 'invoiced', 'cancelled',
];

interface AdminOrdersFilterBarProps {
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
  statusFilter: OrderStatus | '';
  onStatusFilterChange: (s: OrderStatus | '') => void;
  onClearFilters: () => void;
}

export function AdminOrdersFilterBar({
  kitchens, selectedKitchenId, onSelectKitchen,
  startDate, endDate, onStartDateChange, onEndDateChange,
  loading, onFetch,
  quickFilters, onQuickFilter,
  search, onSearchChange,
  statusFilter, onStatusFilterChange,
  onClearFilters,
}: AdminOrdersFilterBarProps) {
  const hasActiveFilters = !!(search || statusFilter);

  return (
    <div className="rounded-2xl border border-neutral-black-20 bg-white p-4 space-y-3">
      {/* Cocina + rango de fechas */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="sm:w-56">
          <label className="block text-xs font-semibold text-neutral-black-50 mb-1">Cocina</label>
          <select
            value={selectedKitchenId ?? ''}
            onChange={(e) => onSelectKitchen(e.target.value || null)}
            className="w-full h-10 rounded-full border-[1.5px] border-neutral-black-20 px-4 text-sm text-neutral-black-80 bg-transparent focus:outline-none focus:border-neutral-black-50"
          >
            <option value="">Todas las cocinas</option>
            {kitchens.map((k) => (
              <option key={k.id} value={k.id}>{k.name}</option>
            ))}
          </select>
        </div>
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
            loading={loading}
            loadingText="Buscando..."
            leftIcon={<Search size={16} />}
            className="w-full sm:w-auto"
          >
            Buscar
          </Button>
        </div>
      </div>

      {/* Filtros rápidos de fecha */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((f) => (
          <button
            key={f.label}
            onClick={() => onQuickFilter(f.start, f.end)}
            disabled={loading}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-neutral-black-20 text-neutral-black-50 hover:bg-neutral-black-10 hover:text-neutral-black-80 transition-colors disabled:opacity-50"
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-black-50 pointer-events-none" />
        <Input
          type="text"
          placeholder="Buscar por cliente, teléfono o número de orden…"
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

      {/* Filtro por estado */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onStatusFilterChange('')}
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors',
            statusFilter === ''
              ? 'bg-neutral-black-80 text-white border-transparent'
              : 'border-neutral-black-20 text-neutral-black-50 hover:bg-neutral-black-10',
          )}
        >
          Todos
        </button>
        {STATUS_FILTERS.map((status) => {
          const cfg = STATUS_CONFIG[status];
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => onStatusFilterChange(isActive ? '' : status)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors',
                isActive ? cn(cfg.bg, cfg.color, 'border-transparent') : 'border-neutral-black-20 text-neutral-black-50 hover:bg-neutral-black-10',
              )}
            >
              {cfg.label}
            </button>
          );
        })}
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
              &quot;{search}&quot;
              <button onClick={() => onSearchChange('')}><X size={11} /></button>
            </span>
          )}
          {statusFilter && (
            <span className="text-xs font-medium bg-neutral-black-10 text-neutral-black-80 rounded-full px-2.5 py-0.5 flex items-center gap-1">
              {STATUS_CONFIG[statusFilter].label}
              <button onClick={() => onStatusFilterChange('')}><X size={11} /></button>
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
