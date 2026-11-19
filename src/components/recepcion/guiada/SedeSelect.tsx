"use client";

import { useId } from 'react';
import type { NuevaOrdenForm } from './types';

export function SedeSelect({ form }: { form: NuevaOrdenForm }) {
  const id = useId();
  const { selectedKitchenId, kitchens, kitchensLoading, kitchen } = form;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-neutral-black-80">Sede</label>
      <select
        id={id}
        value={selectedKitchenId ?? ''}
        onChange={(e) => form.handleKitchenChange(e.target.value || null)}
        disabled={kitchensLoading}
        className="h-12 w-full rounded-lg border border-neutral-black-20 bg-white px-3 text-sm text-neutral-black-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-red-100 disabled:opacity-50"
      >
        <option value="">Automática</option>
        {kitchens.map((k) => (
          <option key={k.id} value={k.id}>{k.name}</option>
        ))}
      </select>
      {!selectedKitchenId && kitchen && (
        <p className="text-sm text-neutral-black-80">
          Sede asignada: <span className="font-semibold">{kitchen.name}</span>
        </p>
      )}
      <p className="text-xs text-neutral-black-80/70">Al cambiar la sede se recalcula el domicilio</p>
    </div>
  );
}
