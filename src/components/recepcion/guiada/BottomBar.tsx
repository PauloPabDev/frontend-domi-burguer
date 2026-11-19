"use client";

import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notify } from '@/utils/notify';
import { countUnits, fmt, getMissing, getStepBlocker } from './utils';
import type { NuevaOrdenForm, StepId } from './types';

interface BottomBarProps {
  form: NuevaOrdenForm;
  step: StepId;
  onStepChange: (step: StepId) => void;
}

export function BottomBar({ form, step, onStepChange }: BottomBarProps) {
  const last = step === 4;
  const blocker = last ? getMissing(form)[0] ?? null : getStepBlocker(step, form);
  const units = countUnits(form.orderItems);

  const handleNext = () => {
    if (blocker) { notify.info(blocker); return; }
    if (!last) { onStepChange((step + 1) as StepId); return; }
    if (!form.isSubmitting) form.handleSubmit();
  };

  // Atajo Ctrl/Cmd+Enter para crear la orden; handleNext se reasigna en cada render, por eso no hay deps
  useEffect(() => {
    if (!last) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleNext(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="sticky bottom-0 z-20 -mx-4 grid gap-1.5 border-t border-neutral-black-20 bg-white px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))] lg:mx-0 lg:bottom-3 lg:rounded-2xl lg:border lg:shadow-lg">
      {blocker && (
        <p role="status" className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
          <TriangleAlert aria-hidden="true" className="size-4 shrink-0" />
          {blocker}
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="grid min-w-0 leading-tight">
          <span className="text-[11px] text-neutral-black-80/70">
            {units} {units === 1 ? 'unidad' : 'unidades'} + domicilio
          </span>
          <b className="text-lg font-extrabold text-neutral-black-80">{fmt(form.total)}</b>
        </div>
        <div className="flex gap-2">
          {step > 1 && (
            <Button type="button" variant="outline" className="h-11 px-4" leftIcon={<ArrowLeft className="size-4" />} onClick={() => onStepChange((step - 1) as StepId)}>
              Atrás
            </Button>
          )}
          <Button
            type="button"
            aria-disabled={!!blocker}
            className={`h-11 px-5 ${blocker ? 'opacity-50' : ''}`}
            rightIcon={last ? undefined : <ArrowRight className="size-4" />}
            onClick={handleNext}
          >
            {last ? 'Crear orden' : 'Siguiente'}
          </Button>
        </div>
      </div>
    </div>
  );
}
