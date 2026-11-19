"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { motion, useMotionValue, animate, PanInfo } from "framer-motion";
import { X, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useModalBackButton } from "@/hooks/useModalBackButton";
import { Button } from "@/components/ui/button";

import type {
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalContextValue,
  ModalButtonConfig,
  ModalFooterConfig,
} from "./types";

import {
  modalOverlayVariants,
  modalContentVariants,
  modalHeaderVariants,
  modalTitleVariants,
  modalDescriptionVariants,
  modalBodyVariants,
  modalFooterVariants,
  modalCloseButtonVariants,
  modalDragHandleVariants,
  modalIconContainerVariants,
} from "./variants";

// ============================================
// CONTEXT
// ============================================

const ModalContext = React.createContext<ModalContextValue | null>(null);

export function useModalContext() {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error("Modal components must be used within a Modal");
  }
  return context;
}

// ============================================
// HOOK PARA DETECTAR MOBILE
// ============================================

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}

// ============================================
// MODAL ROOT COMPONENT
// ============================================

export function Modal({
  // Control
  open,
  onOpenChange,

  // Contenido
  children,

  // Header
  title,
  description,
  headerIcon,
  hideCloseButton = false,
  customHeader,

  // Footer
  footer,

  // Variantes
  size = "md",
  variant = "default",

  // Comportamiento
  closeOnOutsideClick = true,
  dirty = false,
  closeOnEscape = true,
  handleBackButton = true,
  historyStateId,
  preventBodyScroll = true,

  // Mobile
  enableDragToDismiss = true,
  dragThreshold = 100,
  mobileBottomSheet = true,

  // Estilos
  overlayClassName,
  contentClassName,
  bodyClassName,

  // Accesibilidad
  ariaLabel,
  ariaDescribedBy,

  // Callbacks
  onOpenComplete,
  onCloseComplete,
  onBeforeClose,

  // Prevenir cierre
  preventCloseSelectors = [".pac-container"],
}: ModalProps) {
  const isMounted = useIsMounted();
  const isMobile = useIsMobile();
  const y = useMotionValue(0);

  // Back button handling
  useModalBackButton({
    open,
    onClose: () => onOpenChange(false),
    stateId: historyStateId,
    enabled: handleBackButton,
  });

  // Handler para cerrar con validacion
  const handleClose = React.useCallback(async () => {
    if (onBeforeClose) {
      const canClose = await onBeforeClose();
      if (!canClose) return;
    }
    onOpenChange(false);
  }, [onBeforeClose, onOpenChange]);

  // Drag to dismiss usando Framer Motion (más confiable que react-use-gesture)
  const handleDrag = React.useCallback(
    (_: unknown, info: PanInfo) => {
      if (!enableDragToDismiss || !isMobile) return;
      // Solo permitir arrastrar hacia abajo
      const newY = Math.max(0, info.offset.y);
      y.set(newY);
    },
    [enableDragToDismiss, isMobile, y]
  );

  const handleDragEnd = React.useCallback(
    (_: unknown, info: PanInfo) => {
      if (!enableDragToDismiss || !isMobile) return;

      const offsetY = info.offset.y;
      const velocityY = info.velocity.y;

      // Cerrar si arrastró suficiente o con velocidad alta hacia abajo
      const shouldClose = offsetY > dragThreshold || (offsetY > 50 && velocityY > 500);

      if (shouldClose) {
        animate(y, window.innerHeight, {
          type: "spring",
          stiffness: 300,
          damping: 30,
          onComplete: handleClose,
        });
      } else {
        animate(y, 0, {
          type: "spring",
          stiffness: 300,
          damping: 30,
        });
      }
    },
    [enableDragToDismiss, isMobile, dragThreshold, y, handleClose]
  );

  // Handler para click fuera
  const handleInteractOutside = React.useCallback(
    (event: Event) => {
      if (!closeOnOutsideClick || dirty) {
        event.preventDefault();
        return;
      }

      // Verificar si el click fue en un elemento que deberia prevenir el cierre
      if (event.target instanceof HTMLElement) {
        for (const selector of preventCloseSelectors) {
          if (event.target.closest(selector)) {
            event.preventDefault();
            return;
          }
        }
      }
    },
    [closeOnOutsideClick, dirty, preventCloseSelectors]
  );

  // Context value
  const contextValue: ModalContextValue = {
    open,
    onClose: handleClose,
    size,
    variant,
    isMobile,
  };

  if (!isMounted) return null;

  // Determinar si tiene header
  const hasHeader = customHeader || title || description || headerIcon;

  // Determinar si el footer es un config object o un ReactNode
  const isFooterConfig =
    footer && typeof footer === "object" && !React.isValidElement(footer) && "confirm" in footer;

  return (
    <ModalContext.Provider value={contextValue}>
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} modal={preventBodyScroll}>
        <DialogPrimitive.Portal>
          {/* Overlay */}
          <DialogPrimitive.Overlay className={cn(modalOverlayVariants(), overlayClassName)} />

          {/* Content */}
          <DialogPrimitive.Content
            asChild
            onEscapeKeyDown={(e) => {
              if (!closeOnEscape) e.preventDefault();
            }}
            onInteractOutside={handleInteractOutside}
            onOpenAutoFocus={(e) => {
              // Prevenir auto-focus en mobile para mejor UX
              if (isMobile) e.preventDefault();
            }}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
          >
            <motion.div
              style={isMobile && enableDragToDismiss && mobileBottomSheet ? { y } : {}}
              initial={isMobile && mobileBottomSheet ? { y: "100%" } : { opacity: 0, scale: 0.95 }}
              animate={isMobile && mobileBottomSheet ? { y: 0 } : { opacity: 1, scale: 1 }}
              exit={isMobile && mobileBottomSheet ? { y: "100%" } : { opacity: 0, scale: 0.95 }}
              transition={
                isMobile && mobileBottomSheet
                  ? { type: "spring", stiffness: 300, damping: 30 }
                  : { duration: 0.2, ease: "easeOut" }
              }
              onAnimationComplete={(definition) => {
                if (definition === "animate" && open) {
                  onOpenComplete?.();
                  if (isMobile) y.set(0);
                }
                if (definition === "exit" && !open) {
                  onCloseComplete?.();
                }
              }}
              className={cn(
                modalContentVariants({
                  size,
                  variant,
                  mobileMode: mobileBottomSheet ? "bottomSheet" : "centered",
                }),
                contentClassName
              )}
            >
              {/* Drag Handle (mobile only) */}
              {isMobile && mobileBottomSheet && enableDragToDismiss && (
                <motion.div
                  onPan={handleDrag}
                  onPanEnd={handleDragEnd}
                  style={{ touchAction: "none" }}
                  className="w-full py-4 cursor-grab active:cursor-grabbing select-none flex justify-center"
                >
                  <div className={cn(modalDragHandleVariants())} />
                </motion.div>
              )}

              {/* Close Button */}
              {!hideCloseButton && (
                <button
                  className={cn(modalCloseButtonVariants())}
                  aria-label="Cerrar"
                  onClick={handleClose}
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              {/* Hidden Title for Accessibility (when no visible header) */}
              {!hasHeader && (
                <VisuallyHidden.Root asChild>
                  <DialogPrimitive.Title>
                    {ariaLabel || "Modal"}
                  </DialogPrimitive.Title>
                </VisuallyHidden.Root>
              )}

              {/* Header */}
              {hasHeader &&
                (customHeader || (
                  <ModalHeader title={title} description={description} icon={headerIcon} />
                ))}

              {/* Body */}
              <ModalBody className={bodyClassName}>{children}</ModalBody>

              {/* Footer */}
              {footer !== false &&
                (isFooterConfig ? (
                  <ModalFooter config={footer as ModalFooterConfig} />
                ) : React.isValidElement(footer) ? (
                  <div className={cn(modalFooterVariants())}>{footer}</div>
                ) : null)}
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </ModalContext.Provider>
  );
}

// ============================================
// MODAL HEADER
// ============================================

export function ModalHeader({
  title,
  description,
  icon,
  className,
  children,
}: ModalHeaderProps) {
  const { variant } = useModalContext();

  if (children) {
    return (
      <div className={cn(modalHeaderVariants({ variant }), className)}>
        {/* Hidden Title for Accessibility when using custom children */}
        <VisuallyHidden.Root asChild>
          <DialogPrimitive.Title>Modal</DialogPrimitive.Title>
        </VisuallyHidden.Root>
        {children}
      </div>
    );
  }

  return (
    <div className={cn(modalHeaderVariants({ variant, hasIcon: !!icon }), className)}>
      {/* Icon */}
      {icon && <div className={cn(modalIconContainerVariants({ variant }))}>{icon}</div>}

      {/* Title - Always render for accessibility, hide if no visible title */}
      {title ? (
        <DialogPrimitive.Title className={cn(modalTitleVariants())}>{title}</DialogPrimitive.Title>
      ) : (
        <VisuallyHidden.Root asChild>
          <DialogPrimitive.Title>Modal</DialogPrimitive.Title>
        </VisuallyHidden.Root>
      )}

      {/* Description */}
      {description && (
        <DialogPrimitive.Description className={cn(modalDescriptionVariants())}>
          {description}
        </DialogPrimitive.Description>
      )}
    </div>
  );
}

// ============================================
// MODAL BODY
// ============================================

export function ModalBody({ children, className, padding = "md" }: ModalBodyProps) {
  return <div className={cn(modalBodyVariants({ padding }), className)}>{children}</div>;
}

// ============================================
// MODAL FOOTER
// ============================================

export function ModalFooter({ config, onClose: propOnClose, className, children }: ModalFooterProps) {
  const { onClose: contextOnClose } = useModalContext();
  const onClose = propOnClose || contextOnClose;

  if (children) {
    return <div className={cn(modalFooterVariants(), className)}>{children}</div>;
  }

  if (!config) return null;

  const { cancel, confirm, extra = [], alignment = "end", mobileDirection = "column-reverse" } = config;

  const renderButton = (buttonConfig: ModalButtonConfig, key: string, isCancel = false) => {
    const {
      label,
      variant = isCancel ? "outline" : "primary",
      onClick,
      loading = false,
      loadingText,
      disabled = false,
      icon,
      iconPosition = "left",
      type = "button",
      className: buttonClassName,
    } = buttonConfig;

    const handleClick = async () => {
      if (onClick) {
        await onClick();
      } else if (isCancel) {
        onClose();
      }
    };

    return (
      <Button
        key={key}
        type={type}
        variant={variant}
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn("min-w-[120px] h-12 rounded-[30px]", buttonClassName)}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {loadingText || label}
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
            {label}
            {icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
          </>
        )}
      </Button>
    );
  };

  return (
    <div className={cn(modalFooterVariants({ alignment, mobileDirection }), className)}>
      {/* Extra buttons */}
      {extra.map((btn, idx) => renderButton(btn, `extra-${idx}`))}

      {/* Cancel button */}
      {cancel !== false &&
        cancel &&
        renderButton(
          {
            variant: "outline",
            onClick: onClose,
            ...cancel,
          },
          "cancel",
          true
        )}

      {/* Confirm button */}
      {confirm && renderButton(confirm, "confirm")}
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export { ModalContext, useIsMobile };
export type {
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalButtonConfig,
  ModalFooterConfig,
};
