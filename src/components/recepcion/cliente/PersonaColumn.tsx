"use client";

import { useEnrichedOrders } from '@/hooks/useEnrichedOrders';
import { PersonaState } from '@/hooks/recepcion/useClientePanel';
import { PersonaSummaryCard } from './PersonaSummaryCard';
import { PersonaLocationsSection } from './PersonaLocationsSection';
import { PersonaOrdersSection } from './PersonaOrdersSection';

interface PersonaLike {
  id: string;
  name: string;
  phone: string;
  email?: string;
  photoUrl?: string;
}

interface PersonaColumnProps<T extends PersonaLike> {
  kind: 'client' | 'user';
  title: string;
  icon: React.ReactNode;
  persona: PersonaState<T>;
  meta?: (data: T) => string | undefined;
}

export function PersonaColumn<T extends PersonaLike>({
  kind,
  title,
  icon,
  persona,
  meta,
}: PersonaColumnProps<T>) {
  const enrichedOrders = useEnrichedOrders(persona.orders);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-black-20 bg-white p-4">
      <PersonaSummaryCard
        kind={kind}
        title={title}
        icon={icon}
        status={persona.status}
        name={persona.data?.name}
        phone={persona.data?.phone}
        email={persona.data?.email}
        photoUrl={persona.data?.photoUrl}
        id={persona.data?.id}
        meta={persona.data ? meta?.(persona.data) : undefined}
      />

      {persona.status === 'found' && (
        <>
          <PersonaLocationsSection locations={persona.locations} loading={persona.locationsLoading} />
          <PersonaOrdersSection orders={enrichedOrders} loading={persona.ordersLoading} />
        </>
      )}
    </div>
  );
}
