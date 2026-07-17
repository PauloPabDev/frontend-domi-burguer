"use client";

import { useState } from 'react';
import { Loader2, Pencil, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneNumberInput } from '@/components/ui/inputPhone';
import { ApiClient } from '@/services/clientService';
import { ClientState } from '@/hooks/recepcion/useNuevaOrden';
import { EditClientNameModal } from './EditClientNameModal';

interface ClienteSearchProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  clientState: ClientState;
  client: ApiClient | null;
  onSearch: () => void;
  onCreateClient: (name: string) => void;
  onUpdateName: (name: string) => Promise<void>;
}

function ClientFoundCard({ client, onEditName }: { client: ApiClient; onEditName: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
      <UserCheck className="w-5 h-5 text-green-600 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-green-800 truncate">{client.name}</p>
        <p className="text-xs text-green-600">{client.phone}</p>
      </div>
      <button
        type="button"
        onClick={onEditName}
        title="Modificar nombre"
        className="p-1.5 rounded-md text-green-600 hover:text-green-800 hover:bg-green-100 shrink-0"
      >
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  );
}

interface CreateClientFormProps {
  isCreating: boolean;
  newName: string;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
}

function CreateClientForm({ isCreating, newName, onNameChange, onSubmit }: CreateClientFormProps) {
  return (
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
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSubmit(); } }}
          className="flex-1"
          disabled={isCreating}
        />
        <Button
          type="button"
          variant="outline"
          onClick={onSubmit}
          disabled={isCreating || !newName}
          className="shrink-0"
        >
          {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear'}
        </Button>
      </div>
    </div>
  );
}

export function ClienteSearch({
  phone,
  onPhoneChange,
  clientState,
  client,
  onSearch,
  onCreateClient,
  onUpdateName,
}: ClienteSearchProps) {
  const [newName, setNewName] = useState('');
  const [showEditNameModal, setShowEditNameModal] = useState(false);

  const isLoading = clientState === 'loading' || clientState === 'creating';
  const showCreateForm = clientState === 'not_found' || clientState === 'creating';

  const handleCreate = () => {
    onCreateClient(newName);
    setNewName('');
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-bold text-sm text-neutral-black-80">Buscar cliente</h3>

      <div className="flex gap-2">
        <PhoneNumberInput
          className="flex-1"
          value={phone}
          onChange={(val: string | undefined) => onPhoneChange(val ?? '')}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') { e.preventDefault(); onSearch(); }
          }}
          disabled={isLoading}
        />
        <Button
          type="button"
          onClick={onSearch}
          disabled={isLoading || !phone}
          className="shrink-0"
        >
          {clientState === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
        </Button>
      </div>

      {clientState === 'found' && client && (
        <ClientFoundCard client={client} onEditName={() => setShowEditNameModal(true)} />
      )}

      {showCreateForm && (
        <CreateClientForm
          isCreating={clientState === 'creating'}
          newName={newName}
          onNameChange={setNewName}
          onSubmit={handleCreate}
        />
      )}

      {showEditNameModal && client && (
        <EditClientNameModal
          currentName={client.name}
          onSave={onUpdateName}
          onClose={() => setShowEditNameModal(false)}
        />
      )}
    </div>
  );
}
