"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { SocketProvider } from '@/contexts/SocketContext';
import { RecepcionNavbar } from '@/components/recepcion/RecepcionNavbar';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';

function RecepcionLayoutInner({ children }: { children: React.ReactNode }) {
  const { kitchens, selectedKitchenId, selectedKitchen, selectKitchen } = useKitchenSelector();

  return (
    <SocketProvider role="reception" kitchenId={selectedKitchenId}>
      <RecepcionNavbar
        kitchens={kitchens}
        selectedKitchen={selectedKitchen}
        onKitchenChange={selectKitchen}
      />
      <main className="max-w-screen-xl mx-auto px-4 py-4">{children}</main>
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasAccess = userProfile?.roles?.includes('reception') || userProfile?.roles?.includes('admin');
  if (!user || (userProfile && !hasAccess)) return null;

  return <RecepcionLayoutInner>{children}</RecepcionLayoutInner>;
}
