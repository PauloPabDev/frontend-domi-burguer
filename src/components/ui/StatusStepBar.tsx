'use client';

import { Fragment } from 'react';
import { Check } from 'lucide-react';
import { OrderStatus } from '@/types/orders';
import { STATUS_CONFIG } from '@/types/worker';
import { cn } from '@/lib/utils';

export interface StatusStep {
  key: OrderStatus;
  label: string;
}

interface StatusStepBarProps {
  steps: StatusStep[];
  currentStatus: OrderStatus;
  /** Solo puntos sin etiquetas (para tarjetas compactas) */
  compact?: boolean;
}

export function StatusStepBar({ steps, currentStatus, compact = false }: StatusStepBarProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="flex items-start w-full">
      {steps.map((step, i) => {
        const isPast = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isLast = i === steps.length - 1;
        const cfg = STATUS_CONFIG[step.key];

        return (
          <Fragment key={step.key}>
            {/* Nodo del paso */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={cn(
                  'flex items-center justify-center rounded-full',
                  compact ? 'w-3.5 h-3.5' : 'w-6 h-6',
                  isPast && 'bg-neutral-200',
                  isCurrent && cfg.dotColor,
                  !isPast && !isCurrent && 'border-2 border-neutral-200 bg-white',
                )}
              >
                {isPast && (
                  <Check
                    strokeWidth={3}
                    className={cn('text-neutral-500', compact ? 'w-2 h-2' : 'w-3 h-3')}
                  />
                )}
                {isCurrent && !compact && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white/70" />
                )}
              </div>

              {!compact && (
                <span
                  className={cn(
                    'text-[9px] leading-tight text-center whitespace-nowrap',
                    isCurrent ? `${cfg.color} font-bold` : 'text-neutral-400',
                  )}
                >
                  {step.label}
                </span>
              )}
            </div>

            {/* Conector */}
            {!isLast && (
              <div
                className={cn(
                  'flex-1 h-px mx-0.5',
                  compact ? 'mt-[7px]' : 'mt-3',
                  isPast ? 'bg-neutral-300' : 'bg-neutral-100',
                )}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
