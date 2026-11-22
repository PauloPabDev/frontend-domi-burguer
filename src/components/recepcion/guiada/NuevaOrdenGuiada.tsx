"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useNuevaOrden } from '@/hooks/recepcion/useNuevaOrden';
import { useChatwootBus } from '@/hooks/recepcion/useChatwootBus';
import { useNotes } from '@/hooks/notes/useNotes';
import { notify } from '@/utils/notify';
import { Stepper, STEP_LABELS } from './Stepper';
import { ClientStrip } from './ClientStrip';
import { BottomBar } from './BottomBar';
import { SubmitOverlay } from './SubmitOverlay';
import { OrderAside } from './OrderAside';
import { StepCliente } from './StepCliente';
import { StepEntrega } from './StepEntrega';
import { StepPedido } from './StepPedido';
import { StepConfirmar } from './StepConfirmar';
import { canGoToStep } from './utils';
import type { StepId } from './types';

const ModalAddressAdmin = dynamic(
  () => import('../ModalAddressAdmin').then((m) => m.ModalAddressAdmin),
  { ssr: false }
);

export function NuevaOrdenGuiada() {
  const form = useNuevaOrden();
  useChatwootBus(form.handlePhoneSet);
  const { notes, loading } = useNotes('client', form.client?.id);
  const clientNotes = { notes, loading };

  const [step, setStep] = useState<StepId>(1);
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Cambio de paso: arriba del contenido y el foco en el título para lectores de pantalla
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    rootRef.current?.scrollIntoView({ block: 'start' });
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  // Si el cliente deja de estar encontrado (p. ej. llega otro teléfono por Chatwoot), no se puede seguir en pasos posteriores
  useEffect(() => {
    if (step > 1 && !canGoToStep(2, form)) setStep(1);
  }, [step, form]);

  useEffect(() => {
    if (form.submitSuccess) {
      notify.success('¡Orden creada!', 'La orden fue enviada a cocina.');
    }
  }, [form.submitSuccess]);

  const goToStep = useCallback((target: StepId) => {
    if (canGoToStep(target, form)) setStep(target);
  }, [form]);

  const stepProps = { form, clientNotes };

  return (
    <div ref={rootRef} className="mx-auto flex w-full max-w-[1200px] scroll-mt-28 flex-col gap-4">
      <Stepper step={step} form={form} onGoToStep={goToStep} />
      {step > 1 && form.client && <ClientStrip {...stepProps} onViewProfile={() => setStep(1)} />}

      <div className={step === 4 ? 'mx-auto w-full max-w-3xl' : 'grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-6'}>
        <div className="grid min-w-0 gap-4">
          <h2 ref={headingRef} tabIndex={-1} className="text-xl font-extrabold text-neutral-black-80 focus:outline-none">
            {STEP_LABELS[step]}
          </h2>
          {step === 1 && <StepCliente {...stepProps} />}
          {step === 2 && <StepEntrega {...stepProps} />}
          {step === 3 && <StepPedido {...stepProps} />}
          {step === 4 && <StepConfirmar {...stepProps} onGoToStep={goToStep} />}
        </div>
        {step < 4 && (
          <aside aria-label="Resumen del pedido" className="hidden lg:sticky lg:top-28 lg:block">
            <OrderAside form={form} />
          </aside>
        )}
      </div>

      <BottomBar form={form} step={step} onStepChange={goToStep} />

      {form.showCreateLocationModal && form.client && (
        <ModalAddressAdmin
          isOpen={form.showCreateLocationModal}
          onClose={() => form.setShowCreateLocationModal(false)}
          clientId={form.client.id}
          onCreated={form.handleLocationCreated}
        />
      )}

      <SubmitOverlay
        isSubmitting={form.isSubmitting}
        error={form.submitError}
        onRetry={form.handleSubmit}
        onClose={form.clearSubmitError}
      />
    </div>
  );
}
