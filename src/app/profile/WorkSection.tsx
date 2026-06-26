"use client";

import Link from "next/link";
import { Bike, ChefHat, ClipboardList, ShieldCheck, ChevronRight } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

const WORK_ROLES: {
  role: string;
  label: string;
  description: string;
  href: string;
  Icon: React.FC<{ className?: string; size?: number }>;
  color: string;
  bg: string;
}[] = [
  {
    role: "courier",
    label: "Domiciliario",
    description: "Ver pedidos asignados y gestionar entregas",
    href: "/domiciliario",
    Icon: Bike,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    role: "cook",
    label: "Cocina",
    description: "Gestionar pedidos en preparación",
    href: "/cocina",
    Icon: ChefHat,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    role: "reception",
    label: "Recepción",
    description: "Tablero de pedidos y gestión de domicilios",
    href: "/recepcion",
    Icon: ClipboardList,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    role: "admin",
    label: "Administración",
    description: "Gestión de usuarios y configuración",
    href: "/admin",
    Icon: ShieldCheck,
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

export function WorkSection() {
  const { userProfile, loading } = useUserProfile();

  if (loading) return null;

  const availableJobs = WORK_ROLES.filter((w) =>
    userProfile?.roles?.includes(w.role)
  );

  if (availableJobs.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wide mb-4">
        MIS TRABAJOS
      </h2>
      <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
        {availableJobs.map(({ role, label, description, href, Icon, color, bg }) => (
          <Link
            key={role}
            href={href}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
              <Icon className={color} size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-800 group-hover:text-primary-red transition-colors">
                {label}
              </p>
              <p className="text-xs text-neutral-500 truncate">{description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-red transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
