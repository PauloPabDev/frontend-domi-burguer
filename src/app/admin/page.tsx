"use client";

import Link from 'next/link';
import { Users, ChefHat, ShieldCheck, Package, Activity, ClipboardList } from 'lucide-react';

const CARDS = [
  {
    href: '/admin/ordenes',
    Icon: ClipboardList,
    title: 'Órdenes',
    description: 'Ver y gestionar pedidos de cada cocina, cambiar estados y pagos',
    color: 'bg-red-50 text-primary-red',
  },
  {
    href: '/admin/usuarios',
    Icon: Users,
    title: 'Usuarios',
    description: 'Gestionar roles y cocinas asignadas',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    href: '/admin/cocinas',
    Icon: ChefHat,
    title: 'Cocinas',
    description: 'Ver cocinas registradas en el sistema',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    href: '/admin/productos',
    Icon: Package,
    title: 'Productos',
    description: 'Ver y editar productos del menú',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    href: '/admin/monitoreo',
    Icon: Activity,
    title: 'Monitoreo',
    description: 'Clientes y trabajadores conectados en vivo',
    color: 'bg-emerald-50 text-emerald-600',
  },
];

export default function AdminPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center">
          <ShieldCheck size={20} className="text-primary-red" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-black-80">Panel de Administración</h1>
          <p className="text-sm text-neutral-black-50">Gestiona usuarios, cocinas y configuración</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CARDS.map(({ href, Icon, title, description, color }) => (
          <Link
            key={href}
            href={href}
            className="flex items-start gap-4 p-5 rounded-2xl border border-neutral-black-20 bg-white hover:border-primary-red hover:shadow-sm transition-all group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="font-bold text-neutral-black-80 group-hover:text-primary-red transition-colors">{title}</p>
              <p className="text-sm text-neutral-black-50 mt-0.5">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
