"use client";

import { LogOut, ClipboardList, History } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { ConnectionStatus } from '@/types/courier';
import { cn } from '@/lib/utils';

const STATUS_DOT: Record<ConnectionStatus, string> = {
  CONNECTED:    'bg-green-500',
  CONNECTING:   'bg-yellow-400 animate-pulse',
  RECONNECTING: 'bg-yellow-400 animate-pulse',
  DISCONNECTED: 'bg-red-500',
  OFFLINE:      'bg-red-500',
  IDLE:         'bg-neutral-400',
};

const NAV_LINKS = [
  { href: '/recepcion',          label: 'Pedidos',  Icon: ClipboardList },
  { href: '/recepcion/historial', label: 'Historial', Icon: History },
];

export const RecepcionNavbar: React.FC = () => {
  const { orders, connectionStatus } = useSocket();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const activeOrders = orders.filter(
    (o) => o.status === 'fresh' || o.status === 'preparing' || o.status === 'ready_for_pickup'
  );

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-black-20 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-primary-red text-sm shrink-0">DomiBurguer</span>
          <span className="text-xs font-semibold text-neutral-black-50 bg-neutral-black-10 px-2 py-0.5 rounded-full">
            Recepción
          </span>
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
    </header>
  );
};
