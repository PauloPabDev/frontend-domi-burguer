'use client';

import { Fragment } from 'react';
import { WorkerOrder, STATUS_CONFIG } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { formatTime } from '@/lib/dates';
import { cn } from '@/lib/utils';

type TimeLapseEntry = NonNullable<WorkerOrder['timeLapseStatus']>[number];

const TIMELINE_FLOW: OrderStatus[] = ['fresh', 'preparing', 'ready_for_pickup', 'dispatched', 'delivered', 'invoiced'];

function buildTimeline(status: OrderStatus) {
  if (status === 'cancelled') {
    return [{ status: 'cancelled' as OrderStatus, state: 'current' as const }];
  }
  const flow: OrderStatus[] = status === 'pending_payment'
    ? ['fresh', 'preparing', 'ready_for_pickup', 'dispatched', 'delivered', 'pending_payment', 'invoiced']
    : TIMELINE_FLOW;
  const idx = flow.indexOf(status);
  return flow.map((s, i) => ({
    status: s,
    state: (i < idx ? 'done' : i === idx ? 'current' : 'pending') as 'done' | 'current' | 'pending',
  }));
}

function minutesDiff(a: string, b: string | undefined): number {
  const bTime = b ? new Date(b).getTime() : Date.now();
  return Math.max(0, Math.round((bTime - new Date(a).getTime()) / 60000));
}

export interface OrderStatusTimelineProps {
  status: OrderStatus;
  timeLapseStatus?: TimeLapseEntry[];
}

export function OrderStatusTimeline({ status, timeLapseStatus = [] }: OrderStatusTimelineProps) {
  const timeline = buildTimeline(status);
  const timeMap = Object.fromEntries(timeLapseStatus.map((e) => [e.status, e.updatedAt]));

  return (
    <div className="px-4 py-3 border-b border-neutral-100">
      <p className="text-[10px] font-semibold text-neutral-black-50 uppercase tracking-wide mb-3">
        Línea de tiempo
      </p>
      <div>
        {timeline.map(({ status: s, state }, i) => {
          const cfg = STATUS_CONFIG[s];
          const isLast = i === timeline.length - 1;
          const time = timeMap[s];
          const nextTime = !isLast ? timeMap[timeline[i + 1].status] : undefined;
          const diff = time ? minutesDiff(time, nextTime) : null;

          return (
            <Fragment key={s}>
              <div className="flex items-center gap-3 py-2.5">
                {/* Dot */}
                <div
                  className={cn(
                    'w-2.5 h-2.5 rounded-full shrink-0 transition-all',
                    state === 'pending' ? 'bg-neutral-200' : cfg.dotColor,
                  )}
                  style={state === 'current' ? { boxShadow: `0 0 0 3px ${cfg.hex}44` } : undefined}
                />

                {/* Label + time */}
                <div className="flex items-baseline justify-between w-full gap-2">
                  <p className={cn(
                    'text-xs leading-tight',
                    state === 'done' && 'font-medium text-neutral-black-50',
                    state === 'current' && `font-bold ${cfg.color}`,
                    state === 'pending' && 'font-normal text-neutral-300',
                  )}>
                    {cfg.label}
                  </p>
                  {time && (
                    <span className={cn(
                      'text-[10px] tabular-nums shrink-0',
                      state === 'current' ? cfg.color : 'text-neutral-black-40',
                    )}>
                      {formatTime(time)}
                    </span>
                  )}
                </div>
              </div>

              {!isLast && (
                <div className="flex items-center gap-3">
                  <div className="w-2.5 shrink-0 flex justify-center">
                    <div className={cn('w-px h-3', state === 'done' ? cfg.dotColor : 'bg-neutral-200')} />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <hr className="flex-1 border-neutral-100" />
                    {diff !== null && (
                      <span className="text-[9px] font-medium text-neutral-black-30 shrink-0">
                        {diff === 0 ? '< 1 min' : `${diff} min`}
                      </span>
                    )}
                    <hr className="flex-1 border-neutral-100" />
                  </div>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
