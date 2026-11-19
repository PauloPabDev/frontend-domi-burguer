"use client";

import { useMemo } from 'react';
import { ClientNotesList } from './ClientNotesList';
import { ClientOrdersList } from './ClientOrdersList';
import { ClientProfileCard } from './ClientProfileCard';
import { ClientSearchPanel } from './ClientSearchPanel';
import type { StepProps } from './types';

export function StepCliente({ form, clientNotes }: StepProps) {
  // Más reciente primero, sin depender del orden de la API.
  const orders = useMemo(
    () => [...form.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [form.orders],
  );

  if (form.clientState !== 'found' || !form.client) {
    return <div className="mx-auto w-full max-w-xl"><ClientSearchPanel form={form} /></div>;
  }

  const isNew = !form.ordersLoading && orders.length === 0 && !clientNotes.loading && clientNotes.notes.length === 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col gap-4">
        <ClientProfileCard form={form} orders={orders} isNew={isNew} />
        <ClientNotesList notes={clientNotes.notes} loading={clientNotes.loading} phone={form.client.phone} />
      </div>
      <ClientOrdersList orders={orders} form={form} />
    </div>
  );
}
