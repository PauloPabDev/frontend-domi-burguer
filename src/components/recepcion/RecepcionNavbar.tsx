"use client";

import { LogOut, ClipboardList, History, ChevronDown, Store } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { ConnectionStatus } from '@/types/courier';
import { WorkerKitchen } from '@/types/worker';
import { cn } from '@/lib/utils';

interface RecepcionNavbarProps {
  kitchens?: WorkerKitchen[];
  selectedKitchen?: WorkerKitchen | null;
  onKitchenChange?: (id: string | null) => void;
}

const STATUS_DOT: Record<ConnectionStatus, string> = {
  CONNECTED:    'bg-green-500',
  CONNECTING:   'bg-yellow-400 animate-pulse',
  RECONNECTING: 'bg-yellow-400 animate-pulse',
  DISCONNECTED: 'bg-red-500',
  OFFLINE:      'bg-red-500',
  IDLE:         'bg-neutral-400',
};

const NAV_LINKS = [
  { href: '/recepcion',           label: 'Pedidos',   Icon: ClipboardList },
  { href: '/recepcion/historial', label: 'Historial', Icon: History },
];

export const RecepcionNavbar: React.FC<RecepcionNavbarProps> = ({
  kitchens = [],
  selectedKitchen = null,
  onKitchenChange,
}) => {
  const { orders, connectionStatus, changeKitchen } = useSocket();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeOrders = orders.filter(
    (o) => o.status === 'fresh' || o.status === 'preparing' || o.status === 'ready_for_pickup'
  );

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleKitchenSelect = (id: string | null) => {
    onKitchenChange?.(id);
    changeKitchen(id);
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-black-20 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-3">

        {/* Logo + kitchen selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-bold text-primary-red text-sm">DomiBurguer</span>
          <span className="text-neutral-black-20">|</span>

          {kitchens.length > 0 ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-neutral-black-80 hover:text-primary-red transition-colors"
              >
                <Store size={13} className="text-primary-red shrink-0" />
                <span className="max-w-[110px] truncate">
                  {selectedKitchen?.name ?? 'Seleccionar cocina'}
                </span>
                <ChevronDown size={12} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 rounded-xl border border-neutral-black-20 bg-white shadow-lg py-1 z-50">
                  <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold text-neutral-black-50 uppercase tracking-wider">
                    Cocina de trabajo
                  </p>
                  {kitchens.map((k) => (
                    <button
                      key={k.id}
                      onClick={() => handleKitchenSelect(k.id)}
                      className={cn(
                        'w-full px-3 py-2 text-left text-xs hover:bg-neutral-black-10 transition-colors flex items-center gap-2',
                        selectedKitchen?.id === k.id
                          ? 'font-bold text-primary-red'
                          : 'text-neutral-black-80'
                      )}
                    >
                      <Store size={12} className="shrink-0" />
                      {k.name}
                      {k.location && (
                        <span className="ml-auto text-neutral-black-40 text-[10px] truncate max-w-[80px]">
                          {k.location}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs font-semibold text-neutral-black-50 bg-neutral-black-10 px-2 py-0.5 rounded-full">
              Recepción
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                pathname === href
                  ? 'bg-primary-red/10 text-primary-red'
                  : 'text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10'
              )}
            >
              <Icon size={13} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <div className={cn('w-2.5 h-2.5 rounded-full', STATUS_DOT[connectionStatus])} title={connectionStatus} />
          {activeOrders.length > 0 && (
            <span className="min-w-[20px] h-5 flex items-center justify-center bg-primary-red text-white text-[10px] font-bold rounded-full px-1.5">
              {activeOrders.length}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-full text-neutral-black-50 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Backdrop para cerrar dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </header>
  );
};
