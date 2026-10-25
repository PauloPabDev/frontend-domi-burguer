import { Info, Sparkles, TriangleAlert, type LucideIcon } from 'lucide-react';
import { AnnouncementVariant } from '@/types/announcements';

interface VariantStyle {
  label: string;
  Icon: LucideIcon;
  /** Insignia de la tarjeta */
  badge: string;
  /** Color del ícono */
  icon: string;
  /** Borde lateral del toast */
  accent: string;
}

export const VARIANT_STYLES: Record<AnnouncementVariant, VariantStyle> = {
  info: {
    label: 'Aviso',
    Icon: Info,
    badge: 'bg-neutral-black-10 text-neutral-black-80',
    icon: 'text-blue-500',
    accent: 'border-l-neutral-black-50',
  },
  promo: {
    label: 'Promoción',
    Icon: Sparkles,
    badge: 'bg-accent-yellow-40 text-neutral-black-80',
    icon: 'text-accent-yellow-80',
    accent: 'border-l-accent-yellow-80',
  },
  warning: {
    label: 'Importante',
    Icon: TriangleAlert,
    badge: 'bg-primary-red/10 text-primary-red',
    icon: 'text-primary-red',
    accent: 'border-l-primary-red',
  },
};
