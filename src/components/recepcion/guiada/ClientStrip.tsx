"use client";

import { Button } from '@/components/ui/button';
import { ClientAlerts } from './ClientAlerts';
import type { StepProps } from './types';

export function ClientStrip({ form, clientNotes, onViewProfile }: StepProps & { onViewProfile: () => void }) {
  const { client } = form;
  if (!client) return null;

  return (
    <div className="grid gap-2">
      <div className="flex min-w-0 items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5">
        <div aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-700 text-base font-bold text-white">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-neutral-black-80">{client.name}</p>
          <p className="truncate text-xs text-neutral-black-80/70">{client.phone}</p>
        </div>
        <Button type="button" variant="outline" size="md" className="h-11 shrink-0" onClick={onViewProfile}>
          Ver perfil
        </Button>
      </div>
      <ClientAlerts notes={clientNotes.notes} />
    </div>
  );
}
