"use client";

import { ChefHat, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { ConnectionStatus } from '@/types/courier';
import { WorkerKitchen } from '@/types/worker';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface KitchenNavbarProps {
  kitchens: WorkerKitchen[];
  selectedKitchen: WorkerKitchen | null;
  onKitchenChange: (id: string | null) => void;
  loadingKitchens?: boolean;
}

const STATUS_DOT: Record<ConnectionStatus, string> = {
  CONNECTED:     'bg-green-500',
  CONNECTING:    'bg-yellow-400 animate-pulse',
  RECONNECTING:  'bg-yellow-400 animate-pulse',
  DISCONNECTED:  'bg-red-500',
  OFFLINE:       'bg-red-500',
  IDLE:          'bg-neutral-400',
};

export const KitchenNavbar: React.FC<KitchenNavbarProps> = ({
  kitchens,
  selectedKitchen,
  onKitchenChange,
  loadingKitchens: _loadingKitchens = false,
}) => {
  const { orders, connectionStatus, changeKitchen } = useSocket();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeOrders = orders.filter((o) => o.status === 'fresh' || o.status === 'preparing');

  const handleKitchenSelect = (id: string | null) => {
    onKitchenChange(id);
    changeKitchen(id);
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-black-20 shadow-sm">
      <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo + kitchen selector */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary-red text-sm">DomiBurguer</span>
          <span className="text-neutral-black-20">|</span>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-black-80 hover:text-primary-red transition-colors"
            >
              <ChefHat size={14} className="text-primary-red" />
              <span className="max-w-[100px] truncate">{selectedKitchen?.name ?? 'Seleccionar'}</span>
              <ChevronDown size={12} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-xl border border-neutral-black-20 bg-white shadow-lg py-1 z-50">
                {kitchens.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => handleKitchenSelect(k.id)}
                    className={cn(
                      'w-full px-3 py-2 text-left text-xs hover:bg-neutral-black-10 transition-colors',
                      selectedKitchen?.id === k.id ? 'font-bold text-primary-red' : 'text-neutral-black-80'
                    )}
                  >
                    {k.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <div className={cn('w-2.5 h-2.5 rounded-full', STATUS_DOT[connectionStatus])} title={connectionStatus} />

          {activeOrders.length > 0 && (
            <span className="min-w-[20px] h-5 flex items-center justify-center bg-primary-red text-white text-[10px] font-bold rounded-full px-1.5">
              {activeOrders.length}
            </span>
          )}

          <Link
            href="/cocina"
            className={cn(
              'text-xs font-semibold',
              pathname === '/cocina' ? 'text-primary-red' : 'text-neutral-black-50 hover:text-neutral-black-80'
            )}
          >
            Pedidos
          </Link>

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
