export type AnnouncementDisplay = 'modal' | 'toast';
export type AnnouncementVariant = 'info' | 'promo' | 'warning';
export type AnnouncementAudience = 'all' | 'anonymous' | 'logged_in';
export type AnnouncementStatus = 'draft' | 'active' | 'archived';

export interface AnnouncementCta {
  label: string;
  href: string;
}

/** Lo que devuelve el endpoint público: avisos vigentes para este visitante. */
export interface Announcement {
  id: string;
  /** Sube cuando el admin quiere que quienes ya lo vieron lo vuelvan a ver. */
  version: number;
  display: AnnouncementDisplay;
  variant: AnnouncementVariant;
  title: string;
  /** Markdown. */
  body: string;
  imageUrl: string | null;
  cta: AnnouncementCta | null;
  priority: number;
  dismissible: boolean;
  /** Vacío = todas las páginas públicas. */
  routes: string[];
  audience: AnnouncementAudience;
}

/** Lo que ve el admin: incluye estado, fechas y autoría. */
export interface AdminAnnouncement extends Announcement {
  status: AnnouncementStatus;
  startsAt: string | null;
  endsAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type AnnouncementInput = Partial<
  Omit<AdminAnnouncement, 'id' | 'version' | 'createdBy' | 'createdAt' | 'updatedAt'>
> & {
  /** Solo al editar: sube la versión para que lo vuelvan a ver quienes ya lo vieron. */
  republish?: boolean;
};
