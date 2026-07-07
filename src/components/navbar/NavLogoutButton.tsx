"use client";

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const NavLogoutButton: React.FC = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="p-1.5 rounded-full text-neutral-black-50 hover:text-red-500 hover:bg-red-50 transition-colors"
      title="Cerrar sesión"
    >
      <LogOut size={15} />
    </button>
  );
};
