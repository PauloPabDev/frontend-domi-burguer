import Link from 'next/link';
import { ElementType } from 'react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

interface NavPillItemProps {
  label: string;
  Icon: ElementType;
  href?: string;
  onClick?: () => void;
  badge?: number;
  isActive?: boolean;
  /** Clases del texto: por defecto solo se muestra desde lg; por debajo queda solo el ícono (con tooltip). */
  labelClassName?: string;
}

/**
 * Acceso del nav tipo pill. Con `href` renderiza el propio <Link> con el
 * estilo del botón (antes era <Link><Button/></Link>, un <button> dentro de
 * un <a>, HTML inválido que en algunos navegadores de escritorio no navega
 * al hacer clic). Sin `href` renderiza un <button>.
 */
export const NavPillItem: React.FC<NavPillItemProps> = ({
  label,
  Icon,
  href,
  onClick,
  badge,
  isActive = false,
  labelClassName = 'hidden lg:inline',
}) => {
  const className = cn(
    buttonVariants({ variant: isActive ? 'primary' : 'light-outline', size: 'md' }),
    'h-10 lg:h-12 px-3 lg:pl-4 lg:pr-3 text-sm shrink-0',
  );

  const content = (
    <>
      <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
      <span className={labelClassName}>{label}</span>
      {badge !== undefined && (
        <span className="flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-sm font-bold bg-accent-yellow-10 text-neutral-black-80">
          {badge}
        </span>
      )}
    </>
  );

  return href ? (
    <Link
      href={href}
      title={label}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
      className={className}
    >
      {content}
    </Link>
  ) : (
    <button type="button" title={label} aria-label={label} onClick={onClick} className={className}>
      {content}
    </button>
  );
};
