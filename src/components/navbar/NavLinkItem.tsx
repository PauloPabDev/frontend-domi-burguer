import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ElementType } from 'react';

interface NavLinkItemProps {
  href: string;
  label: string;
  Icon?: ElementType;
  isActive: boolean;
}

export const NavLinkItem: React.FC<NavLinkItemProps> = ({ href, label, Icon, isActive }) => (
  <Link
    href={href}
    className={cn(
      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
      isActive
        ? 'bg-primary-red/10 text-primary-red'
        : 'text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10',
    )}
  >
    {Icon && <Icon size={13} />}
    {label}
  </Link>
);
