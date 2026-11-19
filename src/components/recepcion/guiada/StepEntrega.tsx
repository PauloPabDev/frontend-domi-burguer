"use client";

import { useMemo } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeliveryPriceEditor } from './DeliveryPriceEditor';
import { LocationOption, type LocationUsage } from './LocationOption';
import type { StepProps } from './types';

const CARD = 'rounded-xl border border-neutral-black-20 bg-white p-4 shadow-sm';
const NO_USAGE: LocationUsage = { count: 0, last: null };

export function StepEntrega({ form }: StepProps) {
  const { locations, locationsLoading, orders, selectedLocationId, delivery } = form;

  // pedidos y último uso por dirección, a partir del historial del cliente
  const usage = useMemo(() => {
    const map = new Map<string, LocationUsage>();
    for (const o of orders) {
      if (!o.locationId) continue;
      const prev = map.get(o.locationId) ?? NO_USAGE;
      map.set(o.locationId, {
        count: prev.count + 1,
        last: !prev.last || o.createdAt > prev.last ? o.createdAt : prev.last,
      });
    }
    return map;
  }, [orders]);

  const mostUsedId = useMemo(() => {
    let best: string | null = null;
    let max = 1; // con 1 solo pedido no hay "más usada"
    usage.forEach((u, id) => {
      if (u.count > max) { max = u.count; best = id; }
    });
    return best;
  }, [usage]);

  const km = delivery ? (delivery.distance / 1000).toLocaleString('es-CO', { maximumFractionDigits: 1 }) : null;
  const summary = delivery && km ? `${km} km${delivery.duration ? ` · ~${Math.max(1, Math.round(delivery.duration / 60))} min` : ''}` : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <section aria-labelledby="entrega-direcciones" className={CARD}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 id="entrega-direcciones" className="font-bold text-neutral-black-80">Dirección de entrega</h3>
          {locations.length > 0 && (
            <Button type="button" variant="light-outline" className="h-11" leftIcon={<Plus />} onClick={() => form.setShowCreateLocationModal(true)}>
              Nueva dirección
            </Button>
          )}
        </div>

        {locationsLoading ? (
          <p role="status" className="py-6 text-center text-sm text-neutral-black-80/70">Cargando direcciones…</p>
        ) : locations.length === 0 ? (
          <div className="grid justify-items-center gap-2 rounded-xl border border-dashed border-neutral-black-20 px-4 py-6 text-center">
            <MapPin className="size-6 text-neutral-black-80/70" aria-hidden="true" />
            <b className="text-neutral-black-80">Sin direcciones registradas</b>
            <span className="text-sm text-neutral-black-80/70">Agrega la primera para calcular el domicilio.</span>
            <Button type="button" className="h-11" leftIcon={<Plus />} onClick={() => form.setShowCreateLocationModal(true)}>
              Agregar dirección
            </Button>
          </div>
        ) : (
          <div role="radiogroup" aria-labelledby="entrega-direcciones" className="grid gap-3">
            {locations.map((loc) => {
              const selected = loc.id === selectedLocationId;
              return (
                <LocationOption
                  key={loc.id}
                  location={loc}
                  selected={selected}
                  usage={usage.get(loc.id) ?? NO_USAGE}
                  mostUsed={loc.id === mostUsedId}
                  onSelect={form.handleSelectLocation}
                  onDeleted={form.handleLocationDeleted}
                  delivery={selected ? {
                    loading: form.deliveryLoading,
                    error: form.deliveryError,
                    onRetry: () => form.handleSelectLocation(loc.id),
                    summary,
                  } : undefined}
                >
                  {delivery && (
                    <div className="lg:hidden">
                      <DeliveryPriceEditor form={form} />
                    </div>
                  )}
                </LocationOption>
              );
            })}
          </div>
        )}
      </section>

      <aside aria-labelledby="entrega-precio" className={`${CARD} hidden lg:grid gap-3`}>
        <h3 id="entrega-precio" className="font-bold text-neutral-black-80">Precio del domicilio</h3>
        <DeliveryPriceEditor form={form} />
        <p className="text-sm text-neutral-black-80/70">
          Si el cliente negocia o la zona lo amerita, cámbialo aquí; queda marcado como modificado.
        </p>
      </aside>
    </div>
  );
}
