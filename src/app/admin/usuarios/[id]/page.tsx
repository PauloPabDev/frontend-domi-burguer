"use client";

import { useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Pencil, ChefHat, ShieldCheck, Loader2, Phone, Mail } from 'lucide-react';
import { useUserDetail } from '@/hooks/admin/useUsers';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';
import { EditRolesModal } from '@/components/admin/EditRolesModal';
import { EditKitchensModal } from '@/components/admin/EditKitchensModal';

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  admin:     { label: 'Admin',     color: 'text-red-700',    bg: 'bg-red-100' },
  reception: { label: 'Recepción', color: 'text-blue-700',   bg: 'bg-blue-100' },
  cook:      { label: 'Cocina',    color: 'text-violet-700', bg: 'bg-violet-100' },
  courier:   { label: 'Domicilio', color: 'text-green-700',  bg: 'bg-green-100' },
  customer:  { label: 'Cliente',   color: 'text-neutral-600',bg: 'bg-neutral-100' },
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { userDetail, loading, error, updateRoles, updateKitchens } = useUserDetail(id);
  const { kitchens } = useKitchenSelector();
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [showKitchensModal, setShowKitchensModal] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-black-50">
        <Loader2 size={28} className="animate-spin" />
        <p className="text-sm">Cargando usuario...</p>
      </div>
    );
  }

  if (error || !userDetail) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-red-500">{error ?? 'Usuario no encontrado'}</p>
      </div>
    );
  }

  const initials = (userDetail.name ?? userDetail.email ?? '?').charAt(0).toUpperCase();

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-neutral-black-50 hover:text-neutral-black-80 transition-colors"
      >
        <ChevronLeft size={16} />
        Volver
      </button>

      {/* Profile card */}
      <div className="rounded-2xl border border-neutral-black-20 bg-white overflow-hidden">
        <div className="bg-primary-red h-20" />
        <div className="px-5 pb-5">
          <div className="-mt-8 mb-3">
            <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-white flex items-center justify-center shadow-sm">
              {userDetail.photoURL ? (
                <img src={userDetail.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary-red">{initials}</span>
              )}
            </div>
          </div>
          <h2 className="font-bold text-lg text-neutral-black-80">{userDetail.name ?? 'Sin nombre'}</h2>
          <div className="space-y-1 mt-1">
            <div className="flex items-center gap-2 text-sm text-neutral-black-50">
              <Mail size={13} /> {userDetail.email}
            </div>
            {userDetail.phone && (
              <div className="flex items-center gap-2 text-sm text-neutral-black-50">
                <Phone size={13} /> {userDetail.phone}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Roles */}
      <div className="rounded-2xl border border-neutral-black-20 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-primary-red" />
            <h3 className="font-bold text-sm text-neutral-black-80">Roles</h3>
          </div>
          <button
            onClick={() => setShowRolesModal(true)}
            className="flex items-center gap-1 text-xs text-neutral-black-50 hover:text-primary-red transition-colors"
          >
            <Pencil size={12} /> Editar
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(userDetail.roles ?? []).map((role) => {
            const cfg = ROLE_CONFIG[role] ?? { label: role, color: 'text-neutral-600', bg: 'bg-neutral-100' };
            return (
              <span key={role} className={`text-xs font-bold px-3 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
            );
          })}
          {(!userDetail.roles || userDetail.roles.length === 0) && (
            <span className="text-xs text-neutral-black-50">Sin roles asignados</span>
          )}
        </div>
      </div>

      {/* Kitchens */}
      <div className="rounded-2xl border border-neutral-black-20 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ChefHat size={15} className="text-primary-red" />
            <h3 className="font-bold text-sm text-neutral-black-80">Cocinas asignadas</h3>
          </div>
          <button
            onClick={() => setShowKitchensModal(true)}
            className="flex items-center gap-1 text-xs text-neutral-black-50 hover:text-primary-red transition-colors"
          >
            <Pencil size={12} /> Editar
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(userDetail.assignedKitchens ?? []).map((kitchenId) => {
            const kitchen = kitchens.find((k) => k.id === kitchenId);
            return (
              <span key={kitchenId} className="text-xs font-bold px-3 py-1 rounded-full bg-violet-100 text-violet-700">
                {kitchen?.name ?? kitchenId}
              </span>
            );
          })}
          {(!userDetail.assignedKitchens || userDetail.assignedKitchens.length === 0) && (
            <span className="text-xs text-neutral-black-50">Sin cocinas asignadas</span>
          )}
        </div>
      </div>

      {showRolesModal && (
        <EditRolesModal
          currentRoles={userDetail.roles ?? []}
          onSave={updateRoles}
          onClose={() => setShowRolesModal(false)}
        />
      )}
      {showKitchensModal && (
        <EditKitchensModal
          kitchens={kitchens}
          currentKitchenIds={userDetail.assignedKitchens ?? []}
          onSave={updateKitchens}
          onClose={() => setShowKitchensModal(false)}
        />
      )}
    </div>
  );
}
