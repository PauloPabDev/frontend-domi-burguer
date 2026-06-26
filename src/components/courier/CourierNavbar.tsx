"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, ClipboardList, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { cn } from '@/lib/utils';

export const CourierNavbar: React.FC = () => {
  const { logout } = useAuth();
  const { connectionStatus, orders } = useSocket();
  const pathname = usePathname();

  const isConnected = connectionStatus === 'CONNECTED';

  const navLinks = [
    { href: '/domiciliario', label: 'Pedidos', icon: MapPin },
    { href: '/domiciliario/historial', label: 'Historial', icon: ClipboardList },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-neutral-black-20 shadow-sm">
      <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <span className="font-bold text-lg text-primary-red tracking-tight shrink-0">
          DomiBurguer
        </span>

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-1 justify-center">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-primary-red text-white'
                  : 'text-neutral-black-80 hover:bg-neutral-black-10'
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* Right side: connection + orders count + logout */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'w-2.5 h-2.5 rounded-full',
                isConnected ? 'bg-green-500' : connectionStatus === 'RECONNECTING' ? 'bg-yellow-400 animate-pulse' : 'bg-red-500'
              )}
            />
            {orders.length > 0 && (
              <span className="text-xs font-bold bg-primary-red text-white rounded-full w-5 h-5 flex items-center justify-center">
                {orders.length}
              </span>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-full text-neutral-black-50 hover:text-primary-red hover:bg-neutral-black-10 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};
