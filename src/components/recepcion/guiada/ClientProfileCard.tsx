"use client";

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditClientNameModal } from '../EditClientNameModal';
import { ClientSearchPanel } from './ClientSearchPanel';
import { ClientStats } from './ClientStats';
import type { WorkerOrder } from '@/types/worker';
import type { NuevaOrdenForm } from './types';

interface ClientProfileCardProps {
  form: NuevaOrdenForm;
  /** Pedidos del cliente, del más reciente al más antiguo. */
  orders: WorkerOrder[];
  isNew: boolean;
}

export function ClientProfileCard({ form, orders, isNew }: ClientProfileCardProps) {
  const { client } = form;
  const [editingName, setEditingName] = useState(false);
  const [changing, setChanging] = useState(false);

  if (!client) return null;

  return (
    <section aria-label="Cliente" className="flex flex-col gap-4 rounded-xl border border-neutral-black-20 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-yellow-40 text-xl font-bold text-neutral-black-80">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-neutral-black-80">{client.name}</p>
          <p className="text-sm text-neutral-black-80/70">{client.phone}</p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={() => setEditingName(true)} aria-label="Editar nombre del cliente" className="size-11">
          <Pencil className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {isNew ? (
        <p className="rounded-lg bg-neutral-black-3 p-3 text-sm text-neutral-black-80">
          <b>Cliente nuevo</b> · aún sin pedidos ni notas
        </p>
      ) : orders.length > 0 && <ClientStats orders={orders} />}

      {changing ? (
        <ClientSearchPanel form={form} onCancel={() => setChanging(false)} />
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => { form.setPhone(''); setChanging(true); }}
          className="h-11 self-start"
        >
          Cambiar cliente
        </Button>
      )}

      {editingName && (
        <EditClientNameModal currentName={client.name} onSave={form.updateClientName} onClose={() => setEditingName(false)} />
      )}
    </section>
  );
}
