"use client";

import { Plus, MapPin, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Location } from '@/types/locations';
import { DeliveryInfo } from '@/services/workerOrderService';
import { cn } from '@/lib/utils';

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
}

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
}: UbicacionesClienteProps) {
  if (!clientId) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-sm text-neutral-black-80">Dirección de entrega</h3>
        <p className="text-sm text-neutral-black-40 italic">Busca un cliente primero</p>
      </div>
    );
  }

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
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
          {locations.map((location) => {
            const isSelected = selectedLocationId === location.id;
            return (
              <button
                key={location.id}
                type="button"
                onClick={() => onSelectLocation(location.id)}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border text-left transition-colors w-full',
                  isSelected
                    ? 'border-primary-red bg-primary-red/5'
                    : 'border-neutral-black-20 hover:border-neutral-black-40 bg-white'
                )}
              >
                <div className={cn(
                  'mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                  isSelected ? 'border-primary-red' : 'border-neutral-black-30'
                )}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-primary-red" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-neutral-black-80 truncate">{location.name}</p>
                  <p className="text-xs text-neutral-black-50 truncate">{location.address}</p>
                  {location.floor && (
                    <p className="text-xs text-neutral-black-40">Piso / Apto: {location.floor}</p>
                  )}
                </div>
                <MapPin className="w-3.5 h-3.5 text-neutral-black-30 shrink-0 mt-0.5" />
              </button>
            );
          })}
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
