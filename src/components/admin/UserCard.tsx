"use client";

import { useRouter } from 'next/navigation';
import { WorkerUser } from '@/types/worker';
import { cn } from '@/lib/utils';

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  admin:     { label: 'Admin',      color: 'text-red-700',    bg: 'bg-red-100' },
  reception: { label: 'Recepción',  color: 'text-blue-700',   bg: 'bg-blue-100' },
  cook:      { label: 'Cocina',     color: 'text-violet-700', bg: 'bg-violet-100' },
  courier:   { label: 'Domicilio',  color: 'text-green-700',  bg: 'bg-green-100' },
  customer:  { label: 'Cliente',    color: 'text-neutral-600',bg: 'bg-neutral-100' },
};

interface UserCardProps {
  user: WorkerUser;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const router = useRouter();
  const initials = (user.name ?? user.email ?? '?').charAt(0).toUpperCase();

  return (
    <div
      onClick={() => router.push(`/admin/usuarios/${user.id}`)}
      className="rounded-2xl border border-neutral-black-20 bg-white p-4 cursor-pointer hover:border-primary-red hover:shadow-sm transition-all group"
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-primary-red/10 flex items-center justify-center">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-12 h-12 object-cover" />
          ) : (
            <span className="text-lg font-bold text-primary-red">{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-neutral-black-80 truncate group-hover:text-primary-red transition-colors">
            {user.name ?? 'Sin nombre'}
          </p>
          <p className="text-xs text-neutral-black-50 truncate">{user.email}</p>
        </div>
      </div>

      {/* Roles */}
      <div className="flex flex-wrap gap-1">
        {(user.roles ?? []).map((role) => {
          const cfg = ROLE_CONFIG[role] ?? { label: role, color: 'text-neutral-600', bg: 'bg-neutral-100' };
          return (
            <span key={role} className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>
              {cfg.label}
            </span>
          );
        })}
        {(!user.roles || user.roles.length === 0) && (
          <span className="text-[10px] text-neutral-black-50 bg-neutral-black-10 px-2 py-0.5 rounded-full">Sin rol</span>
        )}
      </div>
    </div>
  );
};
