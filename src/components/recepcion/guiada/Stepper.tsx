"use client";

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { canGoToStep, getStepBlocker } from './utils';
import type { NuevaOrdenForm, StepId } from './types';

export const STEP_LABELS: Record<StepId, string> = { 1: 'Cliente', 2: 'Entrega', 3: 'Pedido', 4: 'Confirmar' };
const STEP_IDS: StepId[] = [1, 2, 3, 4];

interface StepperProps {
  step: StepId;
  form: NuevaOrdenForm;
  onGoToStep: (step: StepId) => void;
}

export function Stepper({ step, form, onGoToStep }: StepperProps) {
  return (
    <nav aria-label="Pasos de la orden" className="grid grid-cols-4 gap-1.5 sm:gap-2">
      {STEP_IDS.map((n) => {
        const current = n === step;
        const done = n < step && !getStepBlocker(n, form);
        return (
          <button
            key={n}
            type="button"
            onClick={() => onGoToStep(n)}
            disabled={!canGoToStep(n, form)}
            aria-current={current ? 'step' : undefined}
            className={cn(
              'flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-1.5 text-xs font-bold leading-tight transition-colors sm:flex-row sm:justify-start sm:gap-2.5 sm:px-3.5 sm:text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red/50 disabled:cursor-not-allowed disabled:opacity-55',
              current ? 'bg-red-50 text-primary-red-100 ring-[1.5px] ring-inset ring-primary-red-100' : 'bg-neutral-black-3 text-neutral-black-80/70 enabled:hover:bg-neutral-black-10',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold sm:size-7',
                current ? 'bg-primary-red-100 text-white' : done ? 'bg-green-700 text-white' : 'bg-neutral-black-10 text-neutral-black-80',
              )}
            >
              {done ? <Check className="size-3.5" /> : n}
            </span>
            {STEP_LABELS[n]}
            {done && <span className="sr-only"> (completado)</span>}
          </button>
        );
      })}
    </nav>
  );
}
