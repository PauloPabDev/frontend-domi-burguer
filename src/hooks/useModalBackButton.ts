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

  // Ref para trackear si el modal fue cerrado via back button
  const closedViaBackButton = useRef(false);
  // Ref para trackear si ya hicimos push al history
  const historyPushed = useRef(false);

  // Handler estable para popstate
  const handlePopState = useCallback(() => {
    // Ignore popstate events fired by cleanup calls to history.back() from
    // previously unmounted modal instances (race condition on quick reopen).
    if (_pendingCleanupBacks > 0) {
      _pendingCleanupBacks--;
      return;
    }
    if (historyPushed.current) {
      closedViaBackButton.current = true;
      historyPushed.current = false;
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (!enabled) return;

    if (open) {
      // Modal se abrio - push state al history
      const stateKey = `modal_${stateId}`;
      window.history.pushState({ [stateKey]: true }, "");
      historyPushed.current = true;
      closedViaBackButton.current = false;

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    } else {
      // Modal se cerro
      if (historyPushed.current && !closedViaBackButton.current) {
        // Cerrado programaticamente (no via back) - limpiar history
        window.history.back();
        historyPushed.current = false;
      }
      // Reset flags
      closedViaBackButton.current = false;
    }
  }, [open, enabled, stateId, handlePopState]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (historyPushed.current) {
        _pendingCleanupBacks++;
        window.history.back();
        historyPushed.current = false;
      }
    };
  }, []);

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
