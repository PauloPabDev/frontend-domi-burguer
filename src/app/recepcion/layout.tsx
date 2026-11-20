"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { SocketProvider } from '@/contexts/SocketContext';
import { CourierPanelProvider } from '@/contexts/CourierPanelContext';
import { RecepcionNavbar } from '@/components/recepcion/RecepcionNavbar';
import { RecepcionKanbanSkeleton } from '@/components/recepcion/RecepcionBoardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { CourierManagerPanel } from '@/components/recepcion/CourierManagerPanel';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';

function RecepcionLayoutInner({ children }: { children: React.ReactNode }) {
  const { kitchens, selectedKitchenId, selectedKitchen, selectKitchen } = useKitchenSelector();

  return (
    <SocketProvider role="reception" kitchenId={selectedKitchenId}>
      <CourierPanelProvider>
        <RecepcionNavbar
          kitchens={kitchens}
          selectedKitchen={selectedKitchen}
          onKitchenChange={selectKitchen}
        />
        <main className="w-full px-4 mt-[100px] pt-4 pb-28 md:pb-4">{children}</main>
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
