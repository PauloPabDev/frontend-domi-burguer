"use client";

import { useState } from 'react';
import { Loader2, Search, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneNumberInput } from '@/components/ui/inputPhone';
import type { NuevaOrdenForm } from './types';

interface ClientSearchPanelProps {
  form: NuevaOrdenForm;
  /** Si se pasa, aparece "Cancelar" (búsqueda en línea desde el perfil). */
  onCancel?: () => void;
}

/** Buscar por teléfono + estados de carga y "no existe, créalo". Cubre idle / loading / creating / not_found. */
export function ClientSearchPanel({ form, onCancel }: ClientSearchPanelProps) {
  const { phone, setPhone, clientState, searchClient, createClient } = form;
  const [newName, setNewName] = useState('');

  if (clientState === 'loading' || clientState === 'creating') {
    return (
      <div role="status" className="flex items-center gap-3 rounded-xl border border-neutral-black-20 bg-white p-4 shadow-sm">
        <Loader2 className="size-5 animate-spin text-primary-red-100" aria-hidden="true" />
        <p className="font-bold text-neutral-black-80">
          {clientState === 'loading' ? `Buscando ${phone}…` : 'Creando cliente…'}
        </p>
      </div>
    );
  }

  const trimmedName = newName.trim();

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => { e.preventDefault(); searchClient(); }}
        className="flex flex-col gap-3 rounded-xl border border-neutral-black-20 bg-white p-4 shadow-sm"
      >
        <label htmlFor="guiada-client-phone" className="font-bold text-neutral-black-80">
          Teléfono del cliente
        </label>
        <PhoneNumberInput
          id="guiada-client-phone"
          value={phone}
          onChange={(val: string | undefined) => setPhone(val ?? '')}
          inputClassName="h-14 md:h-14 text-lg"
        />
        <p className="text-sm text-neutral-black-80/70">
          Presiona Enter para buscar. Si el cliente existe verás su historial al instante.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="lg" disabled={!phone} leftIcon={<Search className="size-5" aria-hidden="true" />} className="h-12 flex-1">
            Buscar cliente
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" size="lg" onClick={onCancel} className="h-12">
              Cancelar
            </Button>
          )}
        </div>
      </form>

      {clientState === 'not_found' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!trimmedName) return;
            createClient(trimmedName);
            setNewName('');
          }}
          className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm"
        >
          <h3 className="flex items-center gap-2 font-bold text-amber-900">
            <UserX className="size-5 shrink-0" aria-hidden="true" />
            No hay cliente con ese número
          </h3>
          <p className="text-sm text-amber-900/80">
            Crea uno nuevo con el teléfono <b>{phone}</b>. Podrás agregar su dirección enseguida.
          </p>
          <label htmlFor="guiada-client-name" className="text-sm font-bold text-neutral-black-80">
            Nombre del cliente
          </label>
          <div className="flex flex-wrap gap-2">
            <Input
              id="guiada-client-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre y apellido"
              autoComplete="off"
              className="h-11 min-w-48 flex-1"
            />
            <Button type="submit" size="lg" disabled={!trimmedName} className="h-11">
              Crear cliente
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
