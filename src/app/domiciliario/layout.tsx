"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { SocketProvider } from '@/contexts/SocketContext';
import { CourierNavbar } from '@/components/courier/CourierNavbar';

export default function DomiciliarioLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { userProfile, loading: profileLoading } = useUserProfile();
  const router = useRouter();

  const loading = authLoading || profileLoading;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    const isCourier = userProfile?.roles?.includes('courier');
    if (userProfile && !isCourier) {
      router.replace('/');
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (userProfile && !userProfile.roles?.includes('courier'))) {
    return null;
  }

  return (
    <SocketProvider role="courier">
      <CourierNavbar />
      <main className="max-w-screen-md mx-auto px-4  mt-[90px]">{children}</main>
    </SocketProvider>
  );
}
