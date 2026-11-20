import Link from 'next/link';
import { cn } from '@/lib/utils';
import { NavItem } from './navConfig';

interface NavTargetProps {
  item: NavItem;
  className: string;
  children: React.ReactNode;
  role?: string;
  onNavigate?: () => void;
}

/** Enlace (con `href`) o botón (acciones como «Motos»); nunca un <button> dentro de un <a>. */
export const NavTarget: React.FC<NavTargetProps> = ({ item, className, children, role, onNavigate }) => {
  const props = {
    role,
    title: item.label,
    'aria-label': item.badge ? `${item.label}, ${item.badge} pendientes` : item.label,
    className,
  };
  return item.href ? (
    <Link href={item.href} aria-current={item.isActive ? 'page' : undefined} onClick={onNavigate} {...props}>
      {children}
    </Link>
  ) : (
    <button
      type="button"
      onClick={() => {
        onNavigate?.();
        item.onSelect?.();
      }}
      {...props}
    >
      {children}
    </button>
  );
};

/** Número de pendientes sobre el ícono. */
export const NavBadge: React.FC<{ count?: number; className?: string }> = ({ count, className }) =>
  count ? (
    <span
      aria-hidden
      className={cn(
        'absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-accent-yellow-100 px-1 text-[11px] font-extrabold leading-none text-neutral-black-80',
        className,
      )}
    >
      {count}
    </span>
  ) : null;
