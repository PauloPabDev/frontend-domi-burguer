import { RecaptchaVerifier } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Instancias activas de RecaptchaVerifier por id de contenedor DOM.
 * Firebase lanza `auth/internal-error: reCAPTCHA has already been rendered
 * in this element` si se crea un segundo verifier sobre el mismo contenedor
 * sin limpiar el anterior primero (por ejemplo al reenviar el código SMS).
 */
const activeVerifiers = new Map<string, RecaptchaVerifier>();

export const clearRecaptchaVerifier = (containerId: string): void => {
  const existing = activeVerifiers.get(containerId);
  if (existing) {
    try {
      existing.clear();
    } catch {
      // ignore
    }
    activeVerifiers.delete(containerId);
  }
};

interface RecaptchaCallbacks {
  success?: () => void;
  error?: (error: unknown) => void;
  expired?: () => void;
}

/**
 * Crea (o recrea de forma segura) un RecaptchaVerifier invisible sobre el
 * contenedor indicado. Siempre limpia cualquier instancia previa asociada a
 * ese mismo `containerId` antes de crear una nueva, para poder reenviar
 * códigos SMS sin errores.
 */
export const getOrCreateRecaptchaVerifier = (
  containerId: string,
  callbacks?: RecaptchaCallbacks
): RecaptchaVerifier => {
  clearRecaptchaVerifier(containerId);

  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = "";
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: callbacks?.success,
    "expired-callback": callbacks?.expired,
  });

  activeVerifiers.set(containerId, verifier);
  return verifier;
};
