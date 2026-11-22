"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { SocketProvider, useSocket } from '@/contexts/SocketContext';
import { CourierPanelProvider } from '@/contexts/CourierPanelContext';
import { RecepcionNavbar } from '@/components/recepcion/RecepcionNavbar';
import { RecepcionKanbanSkeleton } from '@/components/recepcion/RecepcionBoardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { CourierManagerPanel } from '@/components/recepcion/CourierManagerPanel';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';
import { KitchenSelector } from '@/components/cocina/KitchenSelector';
import { WorkerKitchen } from '@/types/worker';

// Sin cocina elegida el tablero llegaría vacío; se pide elegir una (mismo flujo que el dropdown del navbar)
function NoKitchenNotice({ kitchens, onSelect }: { kitchens: WorkerKitchen[]; onSelect: (id: string) => void }) {
  const { changeKitchen } = useSocket();
  return (
    <div className="flex flex-col items-center">
      <p className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold px-4 py-3 text-center">
        No tienes cocina seleccionada. Selecciona una para ver los pedidos de esa cocina.
      </p>
      <KitchenSelector
        kitchens={kitchens}
        loading={false}
        onSelect={(id) => {
          onSelect(id);
          changeKitchen(id);
        }}
      />
    </div>
  );
}

function RecepcionLayoutInner({ children }: { children: React.ReactNode }) {
  const { kitchens, selectedKitchenId, selectedKitchen, selectKitchen, loading } = useKitchenSelector();
  // Solo en el tablero de pedidos; contabilidad, historial, etc. no dependen de la cocina
  const needsKitchen = usePathname() === '/recepcion' && !loading && !selectedKitchen && kitchens.length > 0;

  return (
    <SocketProvider role="reception" kitchenId={selectedKitchenId}>
      <CourierPanelProvider>
        <RecepcionNavbar
          kitchens={kitchens}
          selectedKitchen={selectedKitchen}
          onKitchenChange={selectKitchen}
        />
        <main className="w-full px-4 mt-[100px] pt-4 pb-28 md:pb-4">
          {needsKitchen ? <NoKitchenNotice kitchens={kitchens} onSelect={selectKitchen} /> : children}
        </main>
        <CourierManagerPanel />
      </CourierPanelProvider>
    </SocketProvider>
  );
}

export default function RecepcionLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { userProfile, loading: profileLoading } = useUserProfile();
  const router = useRouter();

  const loading = authLoading || profileLoading;

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    const hasAccess = userProfile?.roles?.includes('reception') || userProfile?.roles?.includes('admin');
    if (userProfile && !hasAccess) router.replace('/');
  }, [user, userProfile, loading, router]);

  if (loading) {
    // Mismo chrome que RecepcionLayoutInner: barra superior (pill del navbar) + main
    return (
      <>
        <nav className="fixed top-0 left-0 z-40 w-full px-4">
          <Skeleton className="max-w-[828px] md:h-[80px] h-[62px] mt-[20px] mb-[10px] rounded-[60px] w-full mx-auto" />
        </nav>
        <main className="w-full px-4 mt-[100px] py-4">
          <div className="-mb-4 h-[calc(100dvh-116px)] overflow-x-auto overflow-y-hidden">
            <RecepcionKanbanSkeleton />
          </div>
        </main>
      </>
    );
  }

  const hasAccess = userProfile?.roles?.includes('reception') || userProfile?.roles?.includes('admin');
  if (!user || (userProfile && !hasAccess)) return null;

  return <RecepcionLayoutInner>{children}</RecepcionLayoutInner>;
}
