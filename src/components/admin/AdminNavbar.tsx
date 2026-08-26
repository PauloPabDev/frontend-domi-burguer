"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Package, BookOpen } from 'lucide-react';
import { ElementType } from 'react';
import { Button } from '@/components/ui/button';
import { NavWorkerAvatar } from '@/components/navbar/NavWorkerAvatar';
import { NavPillShell } from '@/components/navbar/NavPillShell';
import { NavPillLogo } from '@/components/navbar/NavPillLogo';

interface NavLink {
  href: string;
  label: string;
  Icon: ElementType;
  matchStart: boolean;
}

const NAV_LINKS: NavLink[] = [
  { href: '/admin', label: 'DASHBOARD', Icon: LayoutDashboard, matchStart: false },
  { href: '/admin/usuarios', label: 'USUARIOS', Icon: Users, matchStart: true },
  { href: '/admin/productos', label: 'PRODUCTOS', Icon: Package, matchStart: true },
  { href: '/admin/documentos', label: 'DOCUMENTOS', Icon: BookOpen, matchStart: true },
];

export const AdminNavbar: React.FC = () => {
  const pathname = usePathname();

  return (
    <NavPillShell>
      {/* Left: Avatar */}
      <div className="flex items-center">
        <NavWorkerAvatar />
      </div>

      {/* Center: Logo */}
      <NavPillLogo href="/admin" />

      {/* Right: Nav buttons + logout */}
      <div className="flex items-center justify-end gap-2">
        {NAV_LINKS.map(({ href, label, Icon, matchStart }) => {
          const isActive = matchStart ? pathname.startsWith(href) : pathname === href;
          return (
            <Link key={href} href={href} tabIndex={-1} className="focus:outline-0! focus:ring-0! rounded-full">
              <Button
                variant={isActive ? 'primary' : 'light-outline'}
                size="md"
                leftIcon={<Icon className="w-4 h-4 md:w-5 md:h-5" />}
                className="h-10 lg:h-12 ps-3 pe-2 lg:pl-5 lg:pr-3 text-sm lg:text-base"
              >
                <span className="hidden sm:inline">{label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </NavPillShell>
  );
};
