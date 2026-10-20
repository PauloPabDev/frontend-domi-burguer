"use client";

import { usePathname } from 'next/navigation';
import { ClipboardList, MapPin, BookOpen } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useNavShadow } from '@/components/navbar/useNavShadow';
import { NavWorkerAvatar } from '@/components/navbar/NavWorkerAvatar';
import { NavPillShell } from '@/components/navbar/NavPillShell';
import { NavPillLogo } from '@/components/navbar/NavPillLogo';
import { NavPillItem } from '@/components/navbar/NavPillItem';

export const CourierNavbar: React.FC = () => {
  const { connectionStatus, orders } = useSocket();
  const pathname = usePathname();
  const navShadow = useNavShadow(connectionStatus);

  const isOnHistorial = pathname === '/domiciliario/historial';
  const isOnDocumentos = pathname.startsWith('/domiciliario/documentos');

  return (
    <NavPillShell navShadow={navShadow}>
      {/* Left: Avatar — solo ícono por debajo de lg */}
      <div className="flex-1 min-w-0 flex items-center">
        <NavWorkerAvatar compact />
      </div>

      {/* Center: Logo */}
      <NavPillLogo href="/domiciliario" />

      {/* Right: Historial + Documentos + Orders */}
      <div className="flex-1 min-w-0 flex items-center justify-end gap-1.5 lg:gap-2">
        <NavPillItem
          label="HISTORIAL"
          Icon={ClipboardList}
          href="/domiciliario/historial"
          isActive={isOnHistorial}
        />
        <NavPillItem
          label="DOCUMENTOS"
          Icon={BookOpen}
          href="/domiciliario/documentos"
          isActive={isOnDocumentos}
        />
        <NavPillItem
          label="ÓRDENES"
          Icon={MapPin}
          href="/domiciliario"
          isActive
          badge={orders.length > 0 ? orders.length : undefined}
        />
      </div>
    </NavPillShell>
  );
};
