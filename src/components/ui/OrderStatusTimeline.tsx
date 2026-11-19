'use client';

import { useEffect, useState } from 'react';
import { WorkerOrder, STATUS_CONFIG } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { formatTime } from '@/lib/dates';
import { cn } from '@/lib/utils';

type TimeLapseEntry = NonNullable<WorkerOrder['timeLapseStatus']>[number];

const TIMELINE_FLOW: OrderStatus[] = ['fresh', 'preparing', 'ready_for_pickup', 'dispatched', 'delivered', 'invoiced'];
const TERMINAL: OrderStatus[] = ['invoiced', 'cancelled', 'deleted'];

// Geometría del reloj (viewBox 400×400, centro en 180,180)
const CX = 180;
const R = 128;
const SW = 36;
const C = 2 * Math.PI * R;
const GAP = 2.5;

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

/** Minutos que duró cada etapa: hasta la siguiente con registro, o hasta ahora si es la etapa en curso. */
function buildStages(status: OrderStatus, entries: TimeLapseEntry[]) {
  const timeMap = Object.fromEntries(entries.map((e) => [e.status, e.updatedAt]));
  const flow = buildTimeline(status);
  const now = Date.now();
  let start = 0;
  return flow.map(({ status: s, state }, i) => {
    const time = timeMap[s];
    const t0 = time ? new Date(time).getTime() : null;
    const nextTime = flow.slice(i + 1).map((f) => timeMap[f.status]).find(Boolean);
    const t1 = nextTime
      ? new Date(nextTime).getTime()
      : state === 'current' && !TERMINAL.includes(s) ? now : t0;
    const min = t0 !== null && t1 !== null ? Math.max(0, (t1 - t0) / 60000) : 0;
    const stage = { status: s, state, time, min, start };
    start += min;
    return stage;
  });
}

const minLabel = (m: number) => (m < 1 ? '< 1' : String(Math.round(m)));

export interface OrderStatusTimelineProps {
  status: OrderStatus;
  timeLapseStatus?: TimeLapseEntry[];
}

export function OrderStatusTimeline({ status, timeLapseStatus = [] }: OrderStatusTimelineProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const stages = buildStages(status, timeLapseStatus);
  const total = stages.reduce((sum, s) => sum + s.min, 0);
  const maxMin = Math.max(...stages.map((s) => s.min));
  const slowest = stages.filter((s) => s.min > 0).length > 1 ? stages.find((s) => s.min === maxMin) : undefined;
  const finished = TERMINAL.includes(status);
  const timed = stages.filter((s) => s.time);
  // Reloj de 60 min; si la orden dura más, pasa a 120, 180…
  const scale = Math.max(60, Math.ceil(total / 60) * 60);

  const pt = (m: number, r: number): [number, number] => {
    const a = (m / scale) * 2 * Math.PI - Math.PI / 2;
    return [CX + r * Math.cos(a), CX + r * Math.sin(a)];
  };
  const hovered = hover !== null ? stages[hover] : null;
  const hoveredCfg = hovered ? STATUS_CONFIG[hovered.status] : null;
  const range = timed.length
    ? `${formatTime(timed[0].time!)} → ${finished ? formatTime(timed[timed.length - 1].time!) : 'ahora'}`
    : '';

  return (
    <div className="px-4 py-3 border-b border-neutral-100">
      <p className="text-[10px] font-semibold text-neutral-black-100 uppercase tracking-wide mb-2">
        Línea de tiempo
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <svg
          viewBox="-20 -20 400 400"
          className="w-[200px] h-[200px] shrink-0"
          role="img"
          aria-label={`Reloj de la orden: ${minLabel(total)} minutos en total`}
          onMouseLeave={() => setHover(null)}
        >
          <circle cx={CX} cy={CX} r={R} fill="none" strokeWidth={SW} className="stroke-neutral-100" />

          {Array.from({ length: 12 }, (_, k) => {
            const m = (k * scale) / 12;
            const major = k % 3 === 0;
            const [x1, y1] = pt(m, R + SW / 2 + 4);
            const [x2, y2] = pt(m, R + SW / 2 + (major ? 14 : 9));
            const [tx, ty] = pt(m, R + SW / 2 + 32);
            return (
              <g key={k}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={major ? 2.5 : 1.5} className="stroke-neutral-black-50" opacity={major ? 0.9 : 0.45} />
                {major && (
                  <text x={tx} y={ty + 7} textAnchor="middle" fontSize={22} className="fill-neutral-black-50">{m}</text>
                )}
              </g>
            );
          })}

          {stages.map((s, i) =>
            s.min > 0 ? (
              <circle
                key={s.status}
                cx={CX}
                cy={CX}
                r={R}
                fill="none"
                stroke={STATUS_CONFIG[s.status].hex}
                strokeWidth={SW}
                transform={`rotate(-90 ${CX} ${CX})`}
                strokeDasharray={drawn ? `${Math.max((s.min / scale) * C - GAP, 1.5)} ${C}` : `0 ${C}`}
                strokeDashoffset={-(s.start / scale) * C}
                opacity={hover === null || hover === i ? 1 : 0.3}
                className="cursor-pointer transition-[stroke-dasharray,opacity] duration-700 motion-reduce:transition-none"
                style={{ transitionDelay: drawn ? `${i * 90}ms` : '0ms' }}
                onMouseEnter={() => setHover(i)}
              >
                <title>{`${STATUS_CONFIG[s.status].label}: ${minLabel(s.min)} min`}</title>
              </circle>
            ) : null,
          )}

          {total > 0 && (
            <g
              className="transition-transform duration-[1200ms] ease-out motion-reduce:transition-none"
              style={{ transform: `rotate(${drawn ? (total / scale) * 360 : 0}deg)`, transformOrigin: `${CX}px ${CX}px` }}
            >
              <line x1={CX} y1={CX} x2={CX} y2={CX - (R + SW / 2 + 2)} strokeWidth={4} strokeLinecap="round" className="stroke-neutral-black-80" />
              <circle cx={CX} cy={CX - (R + SW / 2 + 2)} r={6} className="fill-neutral-black-80" />
            </g>
          )}
          <circle cx={CX} cy={CX} r={7} className="fill-neutral-black-80" />

          {/* Centro: total o la etapa señalada */}
          <text
            x={CX} y={CX - 10} textAnchor="middle" fontSize={52} fontWeight={700}
            className={hoveredCfg ? undefined : 'fill-neutral-black-80'}
            fill={hoveredCfg?.hex}
          >
            {hovered ? minLabel(hovered.min) : total > 0 ? minLabel(total) : '–'}
          </text>
          <text x={CX} y={CX + 18} textAnchor="middle" fontSize={21} fontWeight={600} className="fill-neutral-black-80">
            {hoveredCfg ? hoveredCfg.label : finished ? 'minutos en total' : 'minutos hasta ahora'}
          </text>
          <text x={CX} y={CX + 42} textAnchor="middle" fontSize={18} className="fill-neutral-black-50">
            {hovered ? (hovered.time ? formatTime(hovered.time) : 'pendiente') : range}
          </text>
        </svg>

        <ul className="flex-1 min-w-0 w-full flex flex-col" onMouseLeave={() => setHover(null)}>
          {stages.map((s, i) => {
            const cfg = STATUS_CONFIG[s.status];
            const pending = !s.time;
            return (
              <li
                key={s.status}
                onMouseEnter={() => setHover(i)}
                className={cn('rounded-lg px-2 py-1.5 transition-colors', hover === i && 'bg-neutral-50', pending && 'opacity-50')}
              >
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={cn('w-2.5 h-2.5 rounded-full shrink-0', pending && 'bg-neutral-200')}
                    style={pending ? undefined : { backgroundColor: cfg.hex }}
                  />
                  <span className={cn('truncate', s.state === 'current' ? `font-bold ${cfg.color}` : 'font-semibold text-neutral-black-80')}>
                    {cfg.label}
                  </span>
                  {s === slowest && (
                    <span className="shrink-0 text-[9px] font-semibold text-primary-red bg-primary-red-10 rounded-full px-1.5 py-px">
                      más lenta
                    </span>
                  )}
                  {s.time && (
                    <span className="text-[10px] text-neutral-black-50 tabular-nums shrink-0">{formatTime(s.time)}</span>
                  )}
                  <span className="ml-auto text-[11px] font-semibold tabular-nums text-neutral-black-80 shrink-0">
                    {!s.time ? '–' : TERMINAL.includes(s.status) ? 'Cierre' : `${minLabel(s.min)} min`}
                  </span>
                </div>
                <div className="mt-1 ml-[18px] h-[3px] rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: maxMin > 0 ? `${(s.min / maxMin) * 100}%` : 0, backgroundColor: cfg.hex }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
