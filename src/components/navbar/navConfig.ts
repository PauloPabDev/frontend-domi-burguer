import { ElementType } from 'react';
import {
  Activity,
  BarChart3,
  Bike,
  BellRing,
  BookOpen,
  ChefHat,
  ClipboardList,
  IdCard,
  LayoutDashboard,
  ListChecks,
  Map,
  MapPin,
  Megaphone,
  Package,
  PlusCircle,
  Users,
} from 'lucide-react';

export type NavRole = 'cocina' | 'domiciliario' | 'recepcion' | 'admin';

export interface NavEntry {
  key: string;
  label: string;
  /** Etiqueta corta del dock móvil (≤ 9 letras); por defecto `label`. */
  short?: string;
  Icon: ElementType;
  /** Encabezado del panel «Más». */
  group: string;
  /** Línea gris bajo el nombre en el panel «Más». */
  description: string;
  href?: string;
  /** Acción que no navega (p. ej. abrir un panel); la provee el navbar del rol. */
  action?: boolean;
  /** Activo solo en la ruta exacta (las rutas raíz como /recepcion). */
  exact?: boolean;
  /** Otras rutas exactas que también lo activan (vistas alternativas de la misma pantalla). */
  alsoActive?: string[];
}

/**
 * Accesos de cada rol. El ORDEN ES LA PRIORIDAD: el nav muestra los primeros que
 * caben según el ancho y manda el resto al panel «Más».
 */
export const NAV_CONFIG: Record<NavRole, NavEntry[]> = {
  cocina: [
    { key: 'ordenes', label: 'Órdenes', Icon: ChefHat, group: 'Operación', description: 'Cola de preparación en vivo', href: '/cocina', exact: true },
    { key: 'docs', label: 'Documentos', short: 'Guías', Icon: BookOpen, group: 'Ayuda', description: 'Recetas y procesos', href: '/cocina/documentos' },
  ],
  domiciliario: [
    { key: 'ordenes', label: 'Órdenes', Icon: MapPin, group: 'Operación', description: 'Entregas asignadas', href: '/domiciliario', exact: true, alsoActive: ['/domiciliario/enfoque'] },
    { key: 'historial', label: 'Historial', Icon: ClipboardList, group: 'Operación', description: 'Entregas y ganancias', href: '/domiciliario/historial' },
    { key: 'docs', label: 'Documentos', short: 'Guías', Icon: BookOpen, group: 'Ayuda', description: 'Guías de reparto', href: '/domiciliario/documentos' },
  ],
  recepcion: [
    { key: 'pedidos', label: 'Pedidos', Icon: ClipboardList, group: 'Operación', description: 'Tablero de órdenes en vivo', href: '/recepcion', exact: true },
    { key: 'crear', label: 'Crear pedido', short: 'Crear', Icon: PlusCircle, group: 'Operación', description: 'Pedido por teléfono o mostrador', href: '/recepcion/nueva-orden' },
    { key: 'mapa', label: 'Mapa', Icon: Map, group: 'Operación', description: 'Motos y entregas en el mapa', href: '/recepcion/mapa' },
    { key: 'motos', label: 'Motos', Icon: Bike, group: 'Operación', description: 'Domiciliarios activos y su caja', action: true },
    { key: 'contabilidad', label: 'Contabilidad', short: 'Caja', Icon: BarChart3, group: 'Gestión', description: 'Ventas, pagos y cierres', href: '/recepcion/contabilidad' },
    { key: 'cliente', label: 'Cliente', Icon: IdCard, group: 'Gestión', description: 'Buscar y editar clientes', href: '/recepcion/cliente' },
    { key: 'guiado', label: 'Crear (guiado)', short: 'Guiado', Icon: ListChecks, group: 'Operación', description: 'Pedido paso a paso', href: '/recepcion/nueva-orden-guiada' },
    { key: 'docs', label: 'Documentos', short: 'Guías', Icon: BookOpen, group: 'Ayuda', description: 'Manuales de recepción', href: '/recepcion/documentos' },
  ],
  admin: [
    { key: 'dashboard', label: 'Dashboard', short: 'Inicio', Icon: LayoutDashboard, group: 'Operación', description: 'Resumen del panel', href: '/admin', exact: true },
    { key: 'ordenes', label: 'Órdenes', Icon: ClipboardList, group: 'Operación', description: 'Todas las órdenes por cocina', href: '/admin/ordenes' },
    { key: 'monitoreo', label: 'Monitoreo', Icon: Activity, group: 'Operación', description: 'Clientes y trabajadores en vivo', href: '/admin/monitoreo' },
    { key: 'productos', label: 'Productos', Icon: Package, group: 'Catálogo', description: 'Menú y precios', href: '/admin/productos' },
    { key: 'cocinas', label: 'Cocinas', Icon: ChefHat, group: 'Catálogo', description: 'Sedes registradas', href: '/admin/cocinas' },
    { key: 'usuarios', label: 'Usuarios', Icon: Users, group: 'Personas y avisos', description: 'Roles y cocinas asignadas', href: '/admin/usuarios' },
    { key: 'avisos', label: 'Avisos', Icon: Megaphone, group: 'Personas y avisos', description: 'Modales y promociones', href: '/admin/avisos' },
    { key: 'notificaciones', label: 'Notificaciones', short: 'Push', Icon: BellRing, group: 'Personas y avisos', description: 'Push por segmento', href: '/admin/notificaciones' },
    { key: 'docs', label: 'Documentos', short: 'Guías', Icon: BookOpen, group: 'Ayuda', description: 'Manuales de administración', href: '/admin/documentos' },
  ],
};

export interface NavItem extends NavEntry {
  badge?: number;
  isActive: boolean;
  onSelect?: () => void;
}

/** Muestra los primeros `cap` accesos; si el activo quedó fuera, ocupa el último lugar visible. */
export function splitByCapacity(items: NavItem[], cap: number) {
  if (items.length <= cap) return { visible: items, hidden: [] as NavItem[] };
  let visible = items.slice(0, cap);
  const active = items.find((i) => i.isActive);
  if (active && !visible.includes(active)) visible = [...visible.slice(0, -1), active];
  return { visible, hidden: items.filter((i) => !visible.includes(i)) };
}
