import {
  AUTH_ERROR_MESSAGES,
  DEFAULT_AUTH_ERROR_MESSAGE,
  type AuthErrorMessage,
} from "@/utils/constants/authErrorMessages";

export interface FormattedAuthError extends AuthErrorMessage {
  code: string;
}

/**
 * Extrae el código de error (ej: "auth/invalid-phone-number") de un error
 * lanzado por Firebase Auth. Firebase lanza objetos `FirebaseError` con una
 * propiedad `code`, pero validamos de forma defensiva porque también puede
 * llegar un `Error` genérico o un objeto plano.
 */
export function getFirebaseErrorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" && code.length > 0) return code;
  }
  return "auth/unknown";
}

/**
 * Traduce un error de Firebase Auth a un mensaje en español con instrucciones
 * de cómo solucionarlo. Si el código no está mapeado, devuelve un mensaje
 * genérico en vez del texto crudo de Firebase (que normalmente viene en inglés).
 */
export function getAuthErrorMessage(error: unknown): FormattedAuthError {
  const code = getFirebaseErrorCode(error);
  const detail = AUTH_ERROR_MESSAGES[code] ?? DEFAULT_AUTH_ERROR_MESSAGE;
  return { code, ...detail };
}
