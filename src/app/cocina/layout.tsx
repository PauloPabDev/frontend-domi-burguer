"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { SocketProvider } from '@/contexts/SocketContext';
import { KitchenNavbar } from '@/components/cocina/KitchenNavbar';
import { useKitchenSelector } from '@/hooks/kitchen/useKitchenSelector';

function KitchenLayoutInner({ children }: { children: React.ReactNode }) {
  const { kitchens, selectedKitchenId, selectedKitchen, selectKitchen, loading } = useKitchenSelector();

  return (
    <SocketProvider role="cook" kitchenId={selectedKitchenId}>
      <KitchenNavbar
        kitchens={kitchens}
        selectedKitchen={selectedKitchen}
        onKitchenChange={selectKitchen}
        loadingKitchens={loading}
      />
      <main className="max-w-screen-md mx-auto px-4 py-4">
        {children}
      </main>
    </SocketProvider>
  );
}

export default function CocinaLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { userProfile, loading: profileLoading } = useUserProfile();
  const router = useRouter();

  const loading = authLoading || profileLoading;

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    const isCook = userProfile?.roles?.includes('cook') || userProfile?.roles?.includes('admin');
    if (userProfile && !isCook) router.replace('/');
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isCook = userProfile?.roles?.includes('cook') || userProfile?.roles?.includes('admin');
  if (!user || (userProfile && !isCook)) return null;

  return <KitchenLayoutInner>{children}</KitchenLayoutInner>;
}
