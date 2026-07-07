"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, MapPin } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { useNavShadow } from '@/components/navbar/useNavShadow';
import { NavWorkerAvatar } from '@/components/navbar/NavWorkerAvatar';
import { NavPillShell } from '@/components/navbar/NavPillShell';
import { NavPillLogo } from '@/components/navbar/NavPillLogo';

export const CourierNavbar: React.FC = () => {
  const { connectionStatus, orders } = useSocket();
  const pathname = usePathname();
  const navShadow = useNavShadow(connectionStatus);

  const isOnHistorial = pathname === '/domiciliario/historial';

  return (
    <NavPillShell navShadow={navShadow}>
      {/* Left: Avatar */}
      <div className="flex items-center">
        <NavWorkerAvatar />
      </div>

      {/* Center: Logo */}
      <NavPillLogo href="/domiciliario" />

      {/* Right: Historial + Orders */}
      <div className="flex items-center justify-end gap-2">
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
    </NavPillShell>
  );
};
