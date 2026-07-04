"use client";

import { useState } from 'react';
import { Loader2, UserCheck, UserX, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiClient } from '@/services/clientService';
import { ClientState } from '@/hooks/recepcion/useNuevaOrden';

interface ClienteSearchProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  clientState: ClientState;
  client: ApiClient | null;
  onSearch: () => void;
  onCreateClient: (name: string) => void;
}

export function ClienteSearch({
  phone,
  onPhoneChange,
  clientState,
  client,
  onSearch,
  onCreateClient,
}: ClienteSearchProps) {
  const [newName, setNewName] = useState('');

  const isLoading = clientState === 'loading' || clientState === 'creating';

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-bold text-sm text-neutral-black-80">Buscar cliente</h3>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-black-40" />
          <Input
            type="tel"
            placeholder="+57 300 000 0000"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSearch(); } }}
            className="pl-9"
            disabled={isLoading}
          />
        </div>
        <Button
          type="button"
          onClick={onSearch}
          disabled={isLoading || !phone}
          className="shrink-0"
        >
          {clientState === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Buscar'
          )}
        </Button>
      </div>

      {/* Cliente encontrado */}
      {clientState === 'found' && client && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
          <UserCheck className="w-5 h-5 text-green-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-green-800 truncate">{client.name}</p>
            <p className="text-xs text-green-600">{client.phone}</p>
          </div>
        </div>
      )}

      {/* Cliente no encontrado / creando */}
      {(clientState === 'not_found' || clientState === 'creating') && (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700">No se encontró cliente con ese número</p>
          </div>
          <p className="text-xs text-amber-600 font-medium">¿Crear nuevo cliente?</p>
          <div className="flex gap-2">
            <Input
              placeholder="Nombre del cliente"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onCreateClient(newName); setNewName(''); } }}
              className="flex-1"
              disabled={clientState === 'creating'}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => { onCreateClient(newName); setNewName(''); }}
              disabled={clientState === 'creating' || !newName}
              className="shrink-0"
            >
              {clientState === 'creating' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Crear'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
