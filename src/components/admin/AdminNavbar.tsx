"use client";

import { Users, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { NavStickyShell } from '@/components/navbar/NavStickyShell';
import { NavLinkItem } from '@/components/navbar/NavLinkItem';
import { NavLogoutButton } from '@/components/navbar/NavLogoutButton';

const NAV_LINKS = [
  { href: '/admin',          label: 'Dashboard', Icon: undefined,  matchStart: false },
  { href: '/admin/usuarios', label: 'Usuarios',  Icon: Users,      matchStart: true  },
];

export const AdminNavbar: React.FC = () => {
  const pathname = usePathname();

  return (
    <NavStickyShell>
      <div className="flex items-center gap-3">
        <span className="font-bold text-primary-red text-sm">DomiBurguer</span>
        <span className="flex items-center gap-1 text-xs font-semibold text-neutral-black-50 bg-neutral-black-10 px-2 py-0.5 rounded-full">
          <ShieldCheck size={11} />
          Admin
        </span>
      </div>

      <nav className="flex items-center gap-1">
        {NAV_LINKS.map(({ href, label, Icon, matchStart }) => (
          <NavLinkItem
            key={href}
            href={href}
            label={label}
            Icon={Icon}
            isActive={matchStart ? pathname.startsWith(href) : pathname === href}
          />
        ))}
      </nav>

      <NavLogoutButton />
    </NavStickyShell>
  );
};
