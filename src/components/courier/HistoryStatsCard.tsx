'use client';

import { Bike, Route } from 'lucide-react';
import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CourierStats } from '@/types/courier';
import { formatCOP } from '@/components/ui/OrderItemsList';

const GOAL = 80_000;
const VIBRATE_THRESHOLD = 70_000;

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-4 flex-1">
      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-lg font-bold text-white leading-none">{value}</p>
      <p className="text-[11px] text-white/70 font-medium">{label}</p>
    </div>
  );
}

interface HistoryStatsCardProps {
  stats: CourierStats;
}

function fireConfetti() {
  confetti({
    particleCount: 250,
    startVelocity: 50,
    spread: 90,
    ticks: 250,
    scalar: 1.2,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#ff4757', '#1e90ff', '#2ed573', '#ffa502', '#e84393'],
  });
}

export function HistoryStatsCard({ stats }: HistoryStatsCardProps) {
  const goalReachedRef = useRef(false);

  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const isNearGoal = stats.earnings >= VIBRATE_THRESHOLD && stats.earnings < GOAL;
  const isGoalReached = stats.earnings >= GOAL;

  useEffect(() => {
    if (isGoalReached && !goalReachedRef.current) {
      goalReachedRef.current = true;
      fireConfetti();
    }
    if (!isGoalReached) {
      goalReachedRef.current = false;
    }
  }, [isGoalReached]);

  return (
    <div className={`rounded-2xl overflow-hidden shadow-sm border border-neutral-black-20 ${isNearGoal ? 'animate-card-vibrate' : ''}`}>
      {/* Header: total earnings — tapping always fires confetti */}
      <button
        type="button"
        className="w-full text-left bg-primary-red px-5 pt-5 pb-4 active:opacity-90 transition-opacity"
        onClick={isGoalReached ? fireConfetti : undefined}
      >
        <p className="text-xs text-white/70 capitalize mb-1">{today}</p>
        <p className="text-6xl font-bold text-white">{formatCOP(stats.earnings)}</p>
        <p className="text-sm text-white/80 mt-0.5">Recaudo del día</p>
      </button>

      {/* Stats row */}
      <div className="grid grid-cols-2 divide-x divide-white/20 bg-primary-red border-t border-white/20">
        <StatItem
          icon={<Bike size={17} className="text-white" />}
          value={String(stats.deliveries)}
          label="Entregas"
        />
        <StatItem
          icon={<Route size={17} className="text-white" />}
          value={`${(stats.totalDistance / 1000).toFixed(1)} km`}
          label="Recorridos"
        />
      </div>
    </div>
  );
}
