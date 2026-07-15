import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  sub?: string;
  iconBg: string;
  iconColor: string;
}

export function StatCard({ icon: Icon, title, value, sub, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-black-20 bg-white p-4 flex flex-col gap-1.5">
      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center', iconBg)}>
        <Icon size={18} className={iconColor} />
      </div>
      <p className="text-xs text-neutral-black-50 mt-0.5">{title}</p>
      <p className="text-lg font-bold text-neutral-black-80 leading-none">{value}</p>
      {sub && <p className="text-xs text-neutral-black-50">{sub}</p>}
    </div>
  );
}
