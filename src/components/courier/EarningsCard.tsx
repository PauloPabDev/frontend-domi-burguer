"use client";

import { Bike, DollarSign, Route } from 'lucide-react';
import { CourierStats } from '@/types/courier';
import { cn } from '@/lib/utils';

interface EarningsCardProps {
  stats: CourierStats;
  dailyGoal?: number;
}

const META_DIARIA_DEFAULT = 80_000;

export const EarningsCard: React.FC<EarningsCardProps> = ({
  stats,
  dailyGoal = META_DIARIA_DEFAULT,
}) => {
  const formatCOP = (value: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);

  const percent = Math.min((stats.earnings / dailyGoal) * 100, 100);

  const progressColor =
    percent >= 100 ? 'bg-green-500' : percent >= 50 ? 'bg-primary-red' : 'bg-yellow-400';

  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-neutral-black-20 bg-white">
      {/* Top: total earnings */}
      <div className="bg-primary-red p-5 text-white text-center">
        <DollarSign size={28} className="mx-auto mb-1 opacity-80" />
        <p className="text-3xl font-bold">{formatCOP(stats.earnings)}</p>
        <p className="text-xs opacity-75 mt-0.5 capitalize">{today}</p>
      </div>

      {/* Progress toward daily goal */}
      <div className="p-4">
        <div className="flex justify-between text-xs text-neutral-black-50 mb-1">
          <span>Progreso hacia la meta</span>
          <span className="font-semibold">{percent.toFixed(0)}%</span>
        </div>
        <div className="h-3 rounded-full bg-neutral-black-10 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', progressColor)}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral-black-50 mt-1">
          <span>$0</span>
          <span>Meta: {formatCOP(dailyGoal)}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 divide-x divide-neutral-black-10 border-t border-neutral-black-10">
        <div className="flex flex-col items-center py-4 gap-1">
          <div className="w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center">
            <Bike size={18} className="text-primary-red" />
          </div>
          <p className="text-xl font-bold text-neutral-black-80">{stats.deliveries}</p>
          <p className="text-xs text-neutral-black-50">Entregas</p>
        </div>
        <div className="flex flex-col items-center py-4 gap-1">
          <div className="w-10 h-10 rounded-full bg-neutral-black-10 flex items-center justify-center">
            <Route size={18} className="text-neutral-black-50" />
          </div>
          <p className="text-xl font-bold text-neutral-black-80">
            {(stats.totalDistance / 1000).toFixed(1)} km
          </p>
          <p className="text-xs text-neutral-black-50">Recorridos</p>
        </div>
      </div>
    </div>
  );
};
