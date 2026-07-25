"use client";

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { IdCard, Smartphone } from 'lucide-react';
import { useClientePanel } from '@/hooks/recepcion/useClientePanel';
import { useChatwootBus } from '@/hooks/recepcion/useChatwootBus';
import { ClientePhoneSearchBar } from '@/components/recepcion/cliente/ClientePhoneSearchBar';
import { PersonaColumn } from '@/components/recepcion/cliente/PersonaColumn';

function formatMemberSince(dateStr?: string) {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
}

function ClientePageContent() {
  const searchParams = useSearchParams();
  const { phone, search, clientState, userState } = useClientePanel();
  const [phoneInput, setPhoneInput] = useState('');

  const loading = clientState.status === 'loading' || userState.status === 'loading';

  const handleSearch = useCallback((value: string) => {
    if (!value) return;
    setPhoneInput(value);
    search(value);
  }, [search]);

  // Autocompletar y buscar cuando Chatwoot abre el panel de un contacto
  useChatwootBus(handleSearch);

  // Permite abrir la página directamente con ?phone=... (enlace desde Chatwoot)
  useEffect(() => {
    const phoneParam = searchParams.get('phone');
    if (phoneParam) handleSearch(phoneParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="space-y-1">
        <h1 className="font-bold text-lg text-neutral-black-80">Ficha de cliente</h1>
        <p className="text-sm text-neutral-black-50">
          Busca por número de teléfono para ver la información, direcciones y pedidos del cliente.
        </p>
      </div>

      <ClientePhoneSearchBar
        phone={phoneInput}
        onPhoneChange={setPhoneInput}
        loading={loading}
        onSearch={() => handleSearch(phoneInput)}
      />

      {phone && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PersonaColumn
            kind="client"
            title="Cliente de recepción"
            icon={<IdCard size={14} />}
            persona={clientState}
          />
          <PersonaColumn
            kind="user"
            title="Usuario de la app"
            icon={<Smartphone size={14} />}
            persona={userState}
            meta={(data) => {
              const since = formatMemberSince(data.createdAt);
              const points = `${data.pointsBalance ?? 0} pts`;
              return since ? `${points} · desde ${since}` : points;
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function ClientePage() {
  return (
    <Suspense fallback={null}>
      <ClientePageContent />
    </Suspense>
  );
}
