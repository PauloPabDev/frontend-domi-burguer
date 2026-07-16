'use client';

import { Bike, Route, TrendingUp } from 'lucide-react';
import { CourierStats } from '@/types/courier';
import { formatCOP } from '@/components/ui/OrderItemsList';

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

export function HistoryStatsCard({ stats }: HistoryStatsCardProps) {
  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-neutral-black-20">
      {/* Header: total earnings */}
      <div className="bg-primary-red px-5 pt-5 pb-4">
        <p className="text-xs text-white/70 capitalize mb-1">{today}</p>
        <p className="text-6xl font-bold text-white">{formatCOP(stats.earnings)}</p>
        <p className="text-sm text-white/80 mt-0.5">Recaudo del día</p>
      </div>

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
