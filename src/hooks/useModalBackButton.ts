import { useEffect, useRef, useCallback } from "react";

// Tracks how many history.back() cleanup calls are pending so that the async
// popstate they fire is not mistaken for a user-initiated back press on a
// freshly opened modal (race condition when modal closes and immediately reopens).
let _pendingCleanupBacks = 0;

interface UseModalBackButtonOptions {
  /** Estado de apertura del modal */
  open: boolean;
  /** Callback para cerrar el modal */
  onClose: () => void;
  /** ID unico para identificar este modal en el history state */
  stateId?: string;
  /** Habilitar/deshabilitar el manejo del back button */
  enabled?: boolean;
}

interface UseModalBackButtonReturn {
  /** ID del state usado en history */
  stateId: string;
}

/**
 * Hook unificado para manejar el boton back del navegador en modales.
 *
 * Comportamiento:
 * 1. Al abrir el modal: push state al history
 * 2. Al presionar back: cierra el modal via popstate
 * 3. Al cerrar el modal programaticamente: limpia el history
 *
 * @example
 * ```tsx
 * useModalBackButton({
 *   open: isModalOpen,
 *   onClose: () => setIsModalOpen(false),
 *   stateId: 'my-unique-modal'
 * });
 * ```
 */
export function useModalBackButton({
  open,
  onClose,
  stateId: providedStateId,
  enabled = true,
}: UseModalBackButtonOptions): UseModalBackButtonReturn {
  // Generar ID unico si no se proporciona
  const generatedId = useRef(providedStateId || `modal-${Math.random().toString(36).substr(2, 9)}`);
  const stateId = generatedId.current;

  // onClose suele ser una función inline nueva en cada render: va por ref para que el
  // efecto no se re-ejecute (y no empuje otra entrada al history) con cada render del modal.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Si ya empujamos nuestra entrada al history, y el back diferido pendiente
  const historyPushed = useRef(false);
  const backTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!enabled || !open) return;

    // Re-ejecución inmediata (StrictMode, cierre y reapertura rápidos): se cancela el back
    // pendiente y se reutiliza la entrada ya empujada, en vez de apilar o retroceder de más.
    clearTimeout(backTimer.current);
    if (!historyPushed.current) {
      window.history.pushState({ [`modal_${stateId}`]: true }, "");
      historyPushed.current = true;
    }

    const handlePopState = () => {
      // popstate provocado por un history.back() de limpieza de otro modal: no es del usuario
      if (_pendingCleanupBacks > 0) {
        _pendingCleanupBacks--;
        return;
      }
      if (historyPushed.current) {
        historyPushed.current = false;
        onCloseRef.current();
      }
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Diferido: un envío rápido o el doble montaje de StrictMode no deben encolar dos back()
      // (el segundo sacaba al usuario de la página). Si el modal se cerró con el botón atrás,
      // historyPushed ya es false y no hay nada que limpiar.
      backTimer.current = setTimeout(() => {
        if (!historyPushed.current) return;
        historyPushed.current = false;
        _pendingCleanupBacks++;
        // Si nadie escucha ese popstate, el contador no debe quedar colgado
        window.addEventListener("popstate", () => setTimeout(() => { _pendingCleanupBacks = 0; }, 0), { once: true });
        window.history.back();
      }, 0);
    };
  }, [open, enabled, stateId]);

  return { stateId };
}

/**
 * Hook simplificado que retorna props listos para usar
 */
export function useModalWithBackButton(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  options?: { stateId?: string; enabled?: boolean }
) {
  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const { stateId } = useModalBackButton({
    open,
    onClose: handleClose,
    ...options,
  });

  return {
    open,
    onOpenChange,
    historyStateId: stateId,
  };
}
