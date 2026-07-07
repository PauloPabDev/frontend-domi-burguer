"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AdminNavbar } from '@/components/admin/AdminNavbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { userProfile, loading: profileLoading } = useUserProfile();
  const router = useRouter();

  const loading = authLoading || profileLoading;

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    if (userProfile && !userProfile.roles?.includes('admin')) router.replace('/');
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (userProfile && !userProfile.roles?.includes('admin'))) return null;

  return (
    <>
      <AdminNavbar />
      <main className="max-w-screen-xl mx-auto px-4 mt-[90px] py-6">{children}</main>
    </>
  );
}
