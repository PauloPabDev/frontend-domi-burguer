"use client";

import { useState } from 'react';
import { Plus, Loader2, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Location } from '@/types/locations';
import { DeliveryInfo } from '@/services/workerOrderService';
import { LocationCard } from './LocationCard';

interface UbicacionesClienteProps {
  locations: Location[];
  loading: boolean;
  selectedLocationId: string | null;
  delivery: DeliveryInfo | null;
  deliveryLoading: boolean;
  deliveryError: string | null;
  clientId: string | null;
  onSelectLocation: (id: string) => void;
  onCreateLocation: () => void;
  onRetryDelivery?: () => void;
  onDeleteLocation?: (id: string) => void;
}

const LOCATIONS_VISIBLE = 3;

export function UbicacionesCliente({
  locations,
  loading,
  selectedLocationId,
  delivery,
  deliveryLoading,
  deliveryError,
  clientId,
  onSelectLocation,
  onCreateLocation,
  onRetryDelivery,
  onDeleteLocation,
}: UbicacionesClienteProps) {
  const [expanded, setExpanded] = useState(false);

  if (!clientId) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-sm text-neutral-black-80">Dirección de entrega</h3>
        <p className="text-sm text-neutral-black-40 italic">Busca un cliente primero</p>
      </div>
    );
  }

  const visibleLocations = expanded ? locations : locations.slice(0, LOCATIONS_VISIBLE);
  const hasMore = locations.length > LOCATIONS_VISIBLE;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-neutral-black-80">Dirección de entrega</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCreateLocation}
          className="h-7 px-2 text-xs gap-1"
        >
          <Plus className="w-3 h-3" />
          Nueva
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-neutral-black-50">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando direcciones...
        </div>
      ) : locations.length === 0 ? (
        <div className="p-3 rounded-lg border border-dashed border-neutral-black-20 text-center">
          <p className="text-sm text-neutral-black-50">Sin direcciones registradas</p>
          <button
            type="button"
            onClick={onCreateLocation}
            className="text-xs text-primary-red font-medium mt-1 hover:underline"
          >
            Agregar primera dirección
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visibleLocations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              isSelected={selectedLocationId === location.id}
              onSelect={onSelectLocation}
              onDeleted={onDeleteLocation}
            />
          ))}
          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs text-neutral-black-50 hover:text-neutral-black-80 transition-colors self-start"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Ver {locations.length - LOCATIONS_VISIBLE} más
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Delivery info */}
      {selectedLocationId && (
        <div className="mt-1">
          {deliveryLoading && (
            <div className="flex items-center gap-2 text-xs text-neutral-black-50">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Calculando precio de entrega...
            </div>
          )}
          {deliveryError && !deliveryLoading && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{deliveryError}</span>
              {onRetryDelivery && (
                <button type="button" onClick={onRetryDelivery} className="ml-auto hover:underline flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Reintentar
                </button>
              )}
            </div>
          )}
          {delivery && !deliveryLoading && !deliveryError && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-black-10 text-xs">
              <span className="font-semibold text-neutral-black-80">
                Domicilio: ${delivery.price.toLocaleString('es-CO')}
              </span>
              <span className="text-neutral-black-50">
                {(delivery.distance / 1000).toFixed(1)} km
              </span>
              {delivery.modified && (
                <span className="ml-auto text-amber-600 font-medium">editado</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
