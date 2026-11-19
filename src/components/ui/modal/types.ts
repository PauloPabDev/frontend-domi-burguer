import { ReactNode } from "react";

// ============================================
// TIPOS BASE
// ============================================

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
export type ModalVariant = "default" | "alert" | "confirm" | "form";

// ============================================
// CONFIGURACION DE BOTONES
// ============================================

export interface ModalButtonConfig {
  /** Texto del boton */
  label: string;
  /** Variante visual del boton */
  variant?: "primary" | "yellow" | "outline" | "dark" | "dark-gray" | "light-outline" | "ghost" | "destructive" | "link" | "default";
  /** Callback al hacer click */
  onClick?: () => void | Promise<void>;
  /** Estado de carga */
  loading?: boolean;
  /** Texto durante loading */
  loadingText?: string;
  /** Deshabilitar boton */
  disabled?: boolean;
  /** Icono a mostrar (componente React) */
  icon?: ReactNode;
  /** Posicion del icono */
  iconPosition?: "left" | "right";
  /** Tipo de boton para formularios */
  type?: "button" | "submit" | "reset";
  /** Clases adicionales */
  className?: string;
}

export interface ModalFooterConfig {
  /** Boton de cancelar/cerrar */
  cancel?: ModalButtonConfig | false;
  /** Boton de confirmar/aceptar */
  confirm?: ModalButtonConfig;
  /** Botones adicionales personalizados */
  extra?: ModalButtonConfig[];
  /** Alineacion de botones */
  alignment?: "start" | "center" | "end" | "between";
  /** Direccion en mobile */
  mobileDirection?: "row" | "column" | "column-reverse";
}

// ============================================
// PROPS DEL MODAL
// ============================================

export interface ModalProps {
  // === Control de Estado ===
  /** Estado de apertura del modal (controlado) */
  open: boolean;
  /** Callback cuando cambia el estado de apertura */
  onOpenChange: (open: boolean) => void;

  // === Contenido ===
  /** Contenido principal del modal */
  children: ReactNode;

  // === Header (opcional) ===
  /** Titulo del modal */
  title?: string;
  /** Descripcion bajo el titulo */
  description?: string;
  /** Icono para el header */
  headerIcon?: ReactNode;
  /** Ocultar boton de cerrar */
  hideCloseButton?: boolean;
  /** Header personalizado (reemplaza title/description) */
  customHeader?: ReactNode;

  // === Footer (opcional) ===
  /** Configuracion del footer */
  footer?: ModalFooterConfig | ReactNode | false;

  // === Variantes ===
  /** Tamano del modal */
  size?: ModalSize;
  /** Tipo de modal */
  variant?: ModalVariant;

  // === Comportamiento ===
  /** Cerrar al hacer click fuera */
  closeOnOutsideClick?: boolean;
  /** Hay cambios sin guardar: tocar fuera ya NO cierra (Esc, X y botones sí). Para modales operativos con formulario. */
  dirty?: boolean;
  /** Cerrar con tecla Escape */
  closeOnEscape?: boolean;
  /** Manejar boton back del navegador */
  handleBackButton?: boolean;
  /** ID unico para el history state (auto-generado si no se proporciona) */
  historyStateId?: string;
  /** Prevenir scroll del body cuando esta abierto */
  preventBodyScroll?: boolean;

  // === Mobile ===
  /** Habilitar drag-to-dismiss en mobile */
  enableDragToDismiss?: boolean;
  /** Umbral de drag para cerrar (px) */
  dragThreshold?: number;
  /** Mostrar como bottom sheet en mobile */
  mobileBottomSheet?: boolean;

  // === Estilos ===
  /** Clases para el overlay */
  overlayClassName?: string;
  /** Clases para el contenedor del contenido */
  contentClassName?: string;
  /** Clases para el body (area scrollable) */
  bodyClassName?: string;

  // === Accesibilidad ===
  /** aria-label para el modal */
  ariaLabel?: string;
  /** aria-describedby personalizado */
  ariaDescribedBy?: string;

  // === Callbacks ===
  /** Callback despues de que el modal se abre completamente */
  onOpenComplete?: () => void;
  /** Callback despues de que el modal se cierra completamente */
  onCloseComplete?: () => void;
  /** Interceptar cierre (return false para cancelar) */
  onBeforeClose?: () => boolean | Promise<boolean>;

  // === Prevenir cierre en casos especificos ===
  /** Selectores CSS de elementos que no deben cerrar el modal al clickear fuera */
  preventCloseSelectors?: string[];
}

// ============================================
// PROPS DE SUBCOMPONENTES
// ============================================

export interface ModalHeaderProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  hideCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
  children?: ReactNode;
}

export interface ModalBodyProps {
  children: ReactNode;
  className?: string;
  /** Padding predeterminado */
  padding?: "none" | "sm" | "md" | "lg";
}

export interface ModalFooterProps {
  config?: ModalFooterConfig;
  onClose?: () => void;
  className?: string;
  children?: ReactNode;
}

// ============================================
// CONTEXT
// ============================================

export interface ModalContextValue {
  open: boolean;
  onClose: () => void;
  size: ModalSize;
  variant: ModalVariant;
  isMobile: boolean;
}
