"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChefHat, ChevronDown } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { WorkerKitchen } from '@/types/worker';
import { Button } from '@/components/ui/button';
import { LogoDesktop, LogoMobile } from '@/components/ui/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const GLOW_GREEN = '0 0 24px 6px rgba(34,197,94,0.45)';
const GLOW_ORANGE = '0 0 24px 6px rgba(249,115,22,0.50)';
const GLOW_RED = '0 0 24px 6px rgba(239,68,68,0.45)';

interface KitchenNavbarProps {
  kitchens: WorkerKitchen[];
  selectedKitchen: WorkerKitchen | null;
  onKitchenChange: (id: string | null) => void;
  loadingKitchens?: boolean;
}

export const KitchenNavbar: React.FC<KitchenNavbarProps> = ({
  kitchens,
  selectedKitchen,
  onKitchenChange,
  loadingKitchens: _loadingKitchens = false,
}) => {
  const { orders, connectionStatus, changeKitchen } = useSocket();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navShadow, setNavShadow] = useState<string | undefined>(undefined);
  const user = useAuth().user;
  const router = useRouter();
  const activeOrders = orders.filter((o) => o.status === 'fresh' || o.status === 'preparing');

  useEffect(() => {
    if (connectionStatus === 'CONNECTED') {
      setNavShadow(GLOW_GREEN);
      const t = setTimeout(() => setNavShadow(undefined), 2500);
      return () => clearTimeout(t);
    }
    if (connectionStatus === 'RECONNECTING') {
      setNavShadow(GLOW_ORANGE);
      return;
    }
    setNavShadow(GLOW_RED);
  }, [connectionStatus]);

  const handleKitchenSelect = (id: string | null) => {
    onKitchenChange(id);
    changeKitchen(id);
    setDropdownOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 z-40 w-full px-4">
      <div
        style={{ boxShadow: navShadow, transition: 'box-shadow 0.8s ease-in-out' }}
        className="max-w-[828px] md:h-[80px] h-[62px] mt-[20px] mb-[10px] rounded-[60px] border border-neutral-black-20 flex items-center justify-between w-full mx-auto px-4 sm:px-6 bg-white"
      >{/* Left: Avatar → perfil */}
        <div className="flex w-[300px] h-14 px-0 py-3 rounded-[50px] overflow-hidden items-center">
          <Button
            onClick={() => router.push('/profile')}
            variant="yellow"
            size="md"
            className="rounded-full p-2 lg:h-12 lg:px-5"
          >
            {user?.photoURL ? (
              <Avatar className="w-7 h-7 md:w-8 md:h-8">
                <AvatarImage src={user.photoURL} alt={user.displayName || 'Domiciliario'} />
                <AvatarFallback>{user.displayName?.charAt(0) ?? 'D'}</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="w-7 h-7 md:w-8 md:h-8">
                <AvatarFallback>{user?.displayName?.charAt(0) ?? 'D'}</AvatarFallback>
              </Avatar>
            )}
            <span className="text-neutral-black-80 font-label text-xs md:text-sm">
              {user?.displayName?.split(' ')[0]?.toUpperCase() ?? 'PERFIL'}
            </span>
          </Button>

          <div className="flex w-[220px] items-center relative">
            <Button
              onClick={() => setDropdownOpen((v) => !v)}
              variant="light-outline"
              size="md"
              leftIcon={<ChefHat className="w-4 h-4 text-primary-red" />}
              className="rounded-full h-10 lg:h-12 px-4"
            >
              <span className="max-w-[90px] truncate text-xs md:text-sm">
                {selectedKitchen?.name ?? 'Cocina'}
              </span>
              <ChevronDown size={13} className="shrink-0" />
            </Button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 rounded-2xl border border-neutral-black-20 bg-white shadow-lg py-1.5 z-50">
                {kitchens.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => handleKitchenSelect(k.id)}
                    className={cn(
                      'w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-black-10 transition-colors rounded-xl',
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



        {/* Center: Logo */}
        <div className="flex flex-col w-[130px] h-14 items-center justify-center">
          <div className="hidden md:block w-[106px] h-14">
            <Link href="/cocina" className="focus:outline-0! focus:ring-0!">
              <LogoDesktop height={58} width={106} />
            </Link>
          </div>
          <div className="block md:hidden">
            <Link href="/cocina">
              <LogoMobile width={28} height={40} />
            </Link>
          </div>
        </div>

        {/* Right: badge + logout */}
        <div className="w-[220px] flex items-center justify-end gap-2">
          <Link
            href="/domiciliario"
            tabIndex={-1}
            className="focus:outline-0! focus:ring-0! rounded-full"
          >
            <Button
              variant="primary"
              size="md"
              leftIcon={<ChefHat className="w-4 h-4 md:w-5 md:h-5 text-white" />}
              badge={orders.length > 0 ? orders.length : undefined}
              className="h-10 lg:h-12 ps-3 pe-2 lg:pl-5 lg:pr-3 text-sm lg:text-base"
            >
              <span className="hidden sm:inline">ÓRDENES</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
