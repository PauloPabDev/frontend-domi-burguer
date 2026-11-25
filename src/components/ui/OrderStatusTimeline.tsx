'use client';

import { useEffect, useState } from 'react';
import { WorkerOrder, STATUS_CONFIG } from '@/types/worker';
import { OrderStatus } from '@/types/orders';
import { toDate, formatTime } from '@/lib/dates';
import { cn } from '@/lib/utils';

type TimeLapseEntry = NonNullable<WorkerOrder['timeLapseStatus']>[number];

const TIMELINE_FLOW: OrderStatus[] = ['fresh', 'preparing', 'ready_for_pickup', 'dispatched', 'delivered', 'invoiced'];
const FLOW_WITH_PAYMENT: OrderStatus[] = ['fresh', 'preparing', 'ready_for_pickup', 'dispatched', 'delivered', 'pending_payment', 'invoiced'];
// Al llegar a uno de estos el reloj se detiene
const TERMINAL: OrderStatus[] = ['invoiced', 'cancelled', 'deleted'];

const DIAL_MIN = 30; // minutos que da una vuelta el reloj
const FAST_MIN = 25; // entregar en menos de esto (creada → entregada) es "muy rápido"
const MAX_LAPS = 3; // vueltas rojas que se dibujan fuera del reloj

// Geometría (viewBox 400×400, centro en 200,200)
const CX = 200;
const R = 108;
const SW = 30;
const C = 2 * Math.PI * R;
const GAP = 2;
const OVER_R0 = 176;
const OVER_STEP = 11;
const OVER_SW = 7;
const OVER_STATUS_SW = 10; // línea del color del estado, un poco más gruesa que la roja

interface Stage {
  status: OrderStatus;
  /** ms en que empezó la etapa; null si aún no ocurre */
  start: number | null;
  min: number;
  pending: boolean;
}

/**
 * El backend guarda cada registro como {status: estado ANTERIOR, updatedAt: cuándo salió de él}.
 * Por eso cada etapa empieza donde terminó la anterior (la primera, en createdAt) y la actual
 * no tiene registro propio. Al llegar a un estado final el reloj se detiene en el último registro.
 */
function buildStages(
  status: OrderStatus,
  entries: TimeLapseEntry[],
  createdAt: string,
  now: number,
) {
  const left = entries
    .map((e) => ({ status: e.status, at: toDate(e.updatedAt).getTime() }))
    .filter((e) => !isNaN(e.at))
    .sort((a, b) => a.at - b.at);
  const parsed = toDate(createdAt).getTime();
  const created = isNaN(parsed) ? (left[0]?.at ?? now) : parsed;
  const finished = TERMINAL.includes(status);

  const stages: Stage[] = [];
  let start = created;
  for (const e of left) {
    stages.push({ status: e.status, start, min: Math.max(0, (e.at - start) / 60000), pending: false });
    start = e.at;
  }
  const end = finished ? start : now;
  stages.push({ status, start, min: Math.max(0, (end - start) / 60000), pending: false });

  // Etapas que faltan por venir, para mostrar el camino completo
  const flow = status === 'pending_payment' || left.some((e) => e.status === 'pending_payment') ? FLOW_WITH_PAYMENT : TIMELINE_FLOW;
  const idx = flow.indexOf(status);
  if (!finished && idx >= 0) {
    for (const s of flow.slice(idx + 1)) stages.push({ status: s, start: null, min: 0, pending: true });
  }

  const total = stages.reduce((sum, s) => sum + s.min, 0);
  // Momento en que se entregó: cuando empezó la etapa "Entregado"
  const delivered = stages.find((s) => s.status === 'delivered' && s.start !== null);
  const deliveredMin = delivered ? (delivered.start! - created) / 60000 : null;
  return { stages, total, finished, deliveredMin };
}

const minLabel = (m: number) => (m < 1 ? '< 1' : String(Math.round(m)));
const durLabel = (m: number) => {
  if (m < 1) return '< 1 min';
  const r = Math.round(m);
  return r < 60 ? `${r} min` : `${Math.floor(r / 60)} h ${String(r % 60).padStart(2, '0')} min`;
};
const timeLabel = (ms: number) => formatTime(new Date(ms).toISOString());

export interface OrderStatusTimelineProps {
  status: OrderStatus;
  timeLapseStatus?: TimeLapseEntry[];
  createdAt: string;
}

export function OrderStatusTimeline({ status, timeLapseStatus = [], createdAt }: OrderStatusTimelineProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const running = !TERMINAL.includes(status);

  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [running]);

  const { stages, total, finished, deliveredMin } = buildStages(status, timeLapseStatus, createdAt, now);
  const maxMin = Math.max(...stages.map((s) => s.min));
  const slowest = maxMin >= 1 && stages.filter((s) => s.min > 0).length > 1 ? stages.find((s) => s.min === maxMin) : undefined;
  const over = Math.max(0, total - DIAL_MIN);
  const laps = Math.min(MAX_LAPS, Math.ceil(over / DIAL_MIN));
  const fast = deliveredMin !== null && deliveredMin < FAST_MIN;
  const currentIdx = stages.reduce((acc, x, i) => (x.pending ? acc : i), 0);
  const handClass = over > 0 ? 'stroke-primary-red fill-primary-red' : fast ? 'stroke-green-600 fill-green-600' : 'stroke-neutral-black-80 fill-neutral-black-80';

  const pt = (m: number, r: number): [number, number] => {
    const a = (m / DIAL_MIN) * 2 * Math.PI - Math.PI / 2;
    return [CX + r * Math.cos(a), CX + r * Math.sin(a)];
  };

  const arcs = stages.map((s, i) => {
    const a = stages.slice(0, i).reduce((sum, x) => sum + x.min, 0);
    return { s, i, a, b: Math.min(a + s.min, DIAL_MIN) };
  });

  return (
    <div className="px-4 py-3 border-b border-neutral-100">
      <p className="text-[10px] font-semibold text-neutral-black-100 uppercase tracking-wide mb-2">
        Línea de tiempo
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <div className="flex flex-col items-center gap-2 shrink-0 w-[220px]">
          <svg
            viewBox="0 0 400 400"
            className="w-[220px] h-[220px]"
            role="img"
            aria-label={`Reloj de la orden: ${durLabel(total)} en total`}
            onMouseLeave={() => setHover(null)}
          >
            <circle cx={CX} cy={CX} r={R} fill="none" strokeWidth={SW} className="stroke-neutral-100" />

            {Array.from({ length: DIAL_MIN }, (_, k) => {
              const major = k % 5 === 0;
              const [x1, y1] = pt(k, R + SW / 2 + 4);
              const [x2, y2] = pt(k, R + SW / 2 + (major ? 14 : 8));
              const [tx, ty] = pt(k, R + SW / 2 + 30);
              return (
                <g key={k}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={major ? 2.4 : 1.2} className="stroke-neutral-black-50" opacity={major ? 0.9 : 0.45} />
                  {major && (
                    <text x={tx} y={ty + 6} textAnchor="middle" fontSize={18} className="fill-neutral-black-50">{k}</text>
                  )}
                </g>
              );
            })}

            {arcs.map(({ s, i, a, b }) =>
              b > a ? (
                <circle
                  key={i}
                  cx={CX}
                  cy={CX}
                  r={R}
                  fill="none"
                  stroke={STATUS_CONFIG[s.status].hex}
                  strokeWidth={SW}
                  transform={`rotate(-90 ${CX} ${CX})`}
                  strokeDasharray={drawn ? `${Math.max(((b - a) / DIAL_MIN) * C - GAP, 1.5)} ${C}` : `0 ${C}`}
                  strokeDashoffset={-(a / DIAL_MIN) * C}
                  opacity={hover === null || hover === i ? 1 : 0.3}
                  className="cursor-pointer transition-[stroke-dasharray,opacity] duration-700 motion-reduce:transition-none"
                  style={{ transitionDelay: drawn ? `${i * 90}ms` : '0ms' }}
                  onMouseEnter={() => setHover(i)}
                >
                  <title>{`${STATUS_CONFIG[s.status].label}: ${minLabel(s.min)} min`}</title>
                </circle>
              ) : null,
            )}

            {/* Minutos que pasan de 30: rojo, por fuera del reloj; una vuelta por cada 30 min */}
            {Array.from({ length: laps }, (_, k) => {
              const r = OVER_R0 + k * OVER_STEP;
              const c = 2 * Math.PI * r;
              const len = Math.min(over - k * DIAL_MIN, DIAL_MIN);
              return (
                <g key={k} transform={`rotate(-90 ${CX} ${CX})`}>
                  <circle cx={CX} cy={CX} r={r} fill="none" strokeWidth={OVER_SW} className="stroke-neutral-100" />
                  <circle
                    cx={CX} cy={CX} r={r} fill="none" strokeWidth={OVER_SW} strokeLinecap="round"
                    className="stroke-primary-red"
                    strokeDasharray={`${Math.max((len / DIAL_MIN) * c, 2)} ${c}`}
                  />
                  {/* Encima del rojo: el color de la etapa en la que cayeron esos minutos de más */}
                  {arcs.map(({ s, i, a }) => {
                    const from = Math.max(a, (k + 1) * DIAL_MIN);
                    const to = Math.min(a + s.min, (k + 2) * DIAL_MIN);
                    // Facturada: ya no interesa ver "Entregado" ni "Facturado", queda solo el rojo
                    if (to <= from || s.status === 'invoiced' || (status === 'invoiced' && s.status === 'delivered')) return null;
                    return (
                      <circle
                        key={i} cx={CX} cy={CX} r={r} fill="none" strokeWidth={OVER_STATUS_SW}
                        stroke={STATUS_CONFIG[s.status].hex}
                        strokeDasharray={`${((to - from) / DIAL_MIN) * c} ${c}`}
                        strokeDashoffset={-((from - (k + 1) * DIAL_MIN) / DIAL_MIN) * c}
                      />
                    );
                  })}
                </g>
              );
            })}

            {total > 0 && (
              <g
                className="transition-transform duration-[1200ms] ease-out motion-reduce:transition-none"
                style={{ transform: `rotate(${drawn ? ((total % DIAL_MIN) / DIAL_MIN) * 360 : 0}deg)`, transformOrigin: `${CX}px ${CX}px` }}
              >
                <line x1={CX} y1={CX} x2={CX} y2={CX - (R + SW / 2 + 2)} strokeWidth={4} strokeLinecap="round" className={handClass} />
                <circle cx={CX} cy={CX - (R + SW / 2 + 2)} r={6} className={handClass} />
              </g>
            )}
            <circle cx={CX} cy={CX} r={8} className={handClass} />
          </svg>

          {/* Textos fuera del reloj */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {fast ? (
              <span className="rounded-full bg-green-100 text-green-700 text-[11px] font-semibold px-2.5 py-0.5">
                ¡Buen trabajo! Entregado en {durLabel(deliveredMin)}
              </span>
            ) : null}
            <span className={cn(
              'rounded-full text-[11px] font-semibold px-2.5 py-0.5',
              over > 0 ? 'bg-primary-red-10 text-primary-red' : 'bg-neutral-100 text-neutral-black-80',
            )}>
              {finished ? `Detenido · ${durLabel(total)}` : `En curso · ${durLabel(total)}`}
            </span>
            {over > 0 && (
              <span className="rounded-full bg-primary-red-10 text-primary-red text-[11px] font-semibold px-2.5 py-0.5">
                +{durLabel(over)} sobre los {DIAL_MIN}
              </span>
            )}
          </div>
        </div>

        <ul className="flex-1 min-w-0 w-full flex flex-col" onMouseLeave={() => setHover(null)}>
          {stages.map((s, i) => {
            const cfg = STATUS_CONFIG[s.status];
            const closing = TERMINAL.includes(s.status);
            return (
              <li
                key={i}
                onMouseEnter={() => setHover(i)}
                className={cn('rounded-lg px-2 py-1.5 transition-colors', hover === i && 'bg-neutral-50', s.pending && 'opacity-50')}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <span
                    className={cn('w-2.5 h-2.5 rounded-full shrink-0', s.pending && 'bg-neutral-200')}
                    style={s.pending ? undefined : { backgroundColor: cfg.hex }}
                  />
                  <span className={cn('truncate min-w-[44px]', i === currentIdx ? `font-bold ${cfg.color}` : 'font-semibold text-neutral-black-80')}>
                    {cfg.label}
                  </span>
                  {s === slowest && (
                    <span className="shrink-0 text-[9px] font-semibold text-primary-red bg-primary-red-10 rounded-full px-1.5 py-px">
                      más lenta
                    </span>
                  )}
                  {s.start !== null && (
                    <span className="text-[10px] text-neutral-black-50 tabular-nums shrink-0">{timeLabel(s.start)}</span>
                  )}
                  <span className="ml-auto text-[11px] font-semibold tabular-nums text-neutral-black-80 shrink-0">
                    {s.pending ? '–' : closing ? 'Cierre' : `${minLabel(s.min)} min`}
                  </span>
                </div>
                {!closing && (
                  <div className="mt-1 ml-[18px] h-[3px] rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: maxMin > 0 ? `${(s.min / maxMin) * 100}%` : 0, backgroundColor: cfg.hex }}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
