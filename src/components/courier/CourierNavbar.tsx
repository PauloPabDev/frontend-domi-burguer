"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ClipboardList, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogoDesktop, LogoMobile } from '@/components/ui/icons';

const GLOW_GREEN  = '0 0 24px 6px rgba(34,197,94,0.45)';
const GLOW_ORANGE = '0 0 24px 6px rgba(249,115,22,0.50)';
const GLOW_RED    = '0 0 24px 6px rgba(239,68,68,0.45)';

export const CourierNavbar: React.FC = () => {
  const { user } = useAuth();
  const { connectionStatus, orders } = useSocket();
  const router = useRouter();
  const pathname = usePathname();

  const isOnHistorial = pathname === '/domiciliario/historial';

  const [navShadow, setNavShadow] = useState<string | undefined>(undefined);

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
    // DISCONNECTED
    setNavShadow(GLOW_RED);
  }, [connectionStatus]);

  return (
    <nav className="fixed top-0 left-0 z-300 w-full px-4">
      <div
        style={{ boxShadow: navShadow, transition: 'box-shadow 0.8s ease-in-out' }}
        className="max-w-[828px] md:h-[80px] h-[62px] gap-2 py-0 mt-[20px] mb-[10px] rounded-[60px] border border-solid border-[#e6e6e6] flex items-center justify-between w-full mx-auto px-4! sm:px-6 lg:px-8 bg-[#ffffff]"
      >

        {/* Left: Avatar → perfil */}
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
        </div>

        {/* Center: Logo */}
        <div className="flex flex-col w-[130px] h-14 items-center justify-center gap-2">
          <div className="hidden md:block w-[106px] h-14">
            <Link href="/domiciliario" className="focus:outline-0! focus:ring-0!">
              <LogoDesktop height={58} width={106} />
            </Link>
          </div>
          <div className="block md:hidden">
            <Link href="/domiciliario">
              <LogoMobile width={28} height={40} />
            </Link>
          </div>
        </div>

        {/* Right: Historial + Orders */}
        <div className="w-[300px] items-center flex justify-end gap-2">
          <Link
            href="/domiciliario/historial"
            tabIndex={-1}
            className="focus:outline-0! focus:ring-0! rounded-full"
          >
            <Button
              variant={isOnHistorial ? 'primary' : 'light-outline'}
              size="md"
              leftIcon={<ClipboardList className="w-4 h-4 md:w-5 md:h-5" />}
              className="h-10 lg:h-12 ps-3 pe-2 lg:pl-5 lg:pr-3 text-sm lg:text-base"
            >
              <span className="hidden sm:inline">HISTORIAL</span>
            </Button>
          </Link>

          <Link
            href="/domiciliario"
            tabIndex={-1}
            className="focus:outline-0! focus:ring-0! rounded-full"
          >
            <Button
              variant="primary"
              size="md"
              leftIcon={<MapPin className="w-4 h-4 md:w-5 md:h-5 text-white" />}
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
