"use client";

import { LogOut, Users, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/admin/usuarios', label: 'Usuarios', Icon: Users },
];

export const AdminNavbar: React.FC = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-black-20 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-bold text-primary-red text-sm">DomiBurguer</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-neutral-black-50 bg-neutral-black-10 px-2 py-0.5 rounded-full">
            <ShieldCheck size={11} />
            Admin
          </span>
        </div>

        <nav className="flex items-center gap-1">
          <Link
            href="/admin"
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
              pathname === '/admin'
                ? 'bg-primary-red/10 text-primary-red'
                : 'text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10'
            )}
          >
            Dashboard
          </Link>
          {NAV_LINKS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                pathname.startsWith(href)
                  ? 'bg-primary-red/10 text-primary-red'
                  : 'text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10'
              )}
            >
              <Icon size={13} />
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="p-1.5 rounded-full text-neutral-black-50 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Cerrar sesión"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
};
