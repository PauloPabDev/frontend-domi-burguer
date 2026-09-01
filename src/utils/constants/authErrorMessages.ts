/**
 * Mensajes de error en español para los códigos de error de Firebase Authentication.
 *
 * Cada entrada incluye:
 * - `message`: qué salió mal, en español.
 * - `hint`: instrucciones concretas de cómo solucionarlo, para mostrar al usuario.
 *
 * La lista de códigos fue tomada de la referencia oficial de Firebase Auth
 * (https://firebase.google.com/docs/reference/js/auth.autherrorcodes) y del
 * código fuente del SDK (firebase-js-sdk/packages/auth/src/core/errors.ts),
 * filtrando los que pueden ocurrir en el flujo de registro/verificación de
 * número de teléfono (signInWithPhoneNumber, PhoneAuthProvider.verifyPhoneNumber,
 * linkWithCredential, RecaptchaVerifier) además de los de correo/contraseña
 * y Google que ya maneja la app.
 */

export interface AuthErrorMessage {
  /** Qué salió mal, en español, para mostrar como título del error. */
  message: string;
  /** Instrucciones de cómo solucionarlo, para mostrar debajo del mensaje. */
  hint: string;
}

export const AUTH_ERROR_MESSAGES: Record<string, AuthErrorMessage> = {
  // ─── Número de teléfono ───────────────────────────────────────────────
  "auth/invalid-phone-number": {
    message: "El número de teléfono no es válido.",
    hint: "Revisa que hayas escrito el número completo, sin espacios ni letras, incluyendo el indicativo del país (ej: +57 300 123 4567).",
  },
  "auth/missing-phone-number": {
    message: "Debes ingresar un número de teléfono.",
    hint: "Escribe tu número de celular en el campo antes de continuar.",
  },

  // ─── Límites y seguridad ──────────────────────────────────────────────
  "auth/quota-exceeded": {
    message: "Se alcanzó el límite de mensajes SMS del sistema.",
    hint: "Es un problema temporal de nuestro servidor. Espera unos minutos y vuelve a intentarlo; si persiste, contáctanos.",
  },
  "auth/too-many-requests": {
    message: "Demasiados intentos desde este dispositivo o número.",
    hint: "Por seguridad, espera unos minutos antes de volver a intentarlo.",
  },

  // ─── reCAPTCHA ────────────────────────────────────────────────────────
  "auth/captcha-check-failed": {
    message: "No se pudo verificar que no eres un robot (reCAPTCHA).",
    hint: "Recarga la página e inténtalo de nuevo. Si usas un bloqueador de anuncios, un VPN o navegación privada, desactívalos para este sitio.",
  },
  "auth/missing-recaptcha-token": {
    message: "No se pudo completar la verificación de seguridad (reCAPTCHA).",
    hint: "Recarga la página e inténtalo de nuevo.",
  },
  "auth/invalid-recaptcha-token": {
    message: "La verificación de seguridad (reCAPTCHA) no es válida.",
    hint: "Recarga la página e inténtalo de nuevo.",
  },
  "auth/invalid-recaptcha-action": {
    message: "Ocurrió un problema con la verificación de seguridad (reCAPTCHA).",
    hint: "Recarga la página e inténtalo de nuevo.",
  },
  "auth/recaptcha-not-enabled": {
    message: "La verificación de seguridad no está habilitada para esta app.",
    hint: "Es un problema de configuración del sistema. Por favor contáctanos para reportarlo.",
  },

  // ─── Código de verificación (OTP por SMS) ────────────────────────────
  "auth/invalid-verification-code": {
    message: "El código de verificación no es correcto.",
    hint: "Revisa el SMS que recibiste y escribe los 6 dígitos exactamente como aparecen. Si lo perdiste, solicita un nuevo código con \"Reenviar\".",
  },
  "auth/missing-verification-code": {
    message: "Debes ingresar el código de verificación.",
    hint: "Escribe el código de 6 dígitos que enviamos por SMS a tu teléfono.",
  },
  "auth/code-expired": {
    message: "El código de verificación expiró.",
    hint: "Solicita un nuevo código con el botón \"Reenviar\" e ingrésalo antes de que se acabe el tiempo.",
  },
  "auth/invalid-verification-id": {
    message: "La sesión de verificación no es válida o ya expiró.",
    hint: "Vuelve a solicitar el código desde el principio.",
  },
  "auth/missing-verification-id": {
    message: "Falta información para verificar el código.",
    hint: "Vuelve a solicitar el código con el botón \"Reenviar\" y luego escribe el código recibido.",
  },

  // ─── Cuentas y credenciales ───────────────────────────────────────────
  "auth/credential-already-in-use": {
    message: "Ese número de teléfono ya está vinculado a otra cuenta.",
    hint: "Usa un número de teléfono diferente, o cierra sesión e inicia sesión con la cuenta que ya tiene este número vinculado.",
  },
  "auth/provider-already-linked": {
    message: "Ya tienes un número de teléfono vinculado a tu cuenta.",
    hint: "Primero desvincula el número actual desde tu perfil y luego intenta vincular el nuevo.",
  },
  "auth/account-exists-with-different-credential": {
    message: "Ya existe una cuenta con este dato, pero con otro método de acceso.",
    hint: "Inicia sesión con el método que usaste originalmente (correo o Google) y vincula tu teléfono desde tu perfil.",
  },
  "auth/requires-recent-login": {
    message: "Por seguridad, necesitas volver a iniciar sesión para hacer este cambio.",
    hint: "Cierra sesión, vuelve a iniciar sesión y luego intenta vincular tu teléfono de nuevo.",
  },
  "auth/user-token-expired": {
    message: "Tu sesión expiró.",
    hint: "Vuelve a iniciar sesión e inténtalo de nuevo.",
  },
  "auth/user-not-found": {
    message: "No existe una cuenta con este correo electrónico.",
    hint: "Revisa que el correo esté bien escrito o crea una cuenta nueva.",
  },
  "auth/user-disabled": {
    message: "Esta cuenta ha sido deshabilitada.",
    hint: "Contáctanos si crees que esto es un error.",
  },

  // ─── Conexión y configuración ─────────────────────────────────────────
  "auth/network-request-failed": {
    message: "Hubo un problema de conexión a internet.",
    hint: "Verifica tu conexión y vuelve a intentarlo.",
  },
  "auth/operation-not-allowed": {
    message: "El inicio de sesión con teléfono no está habilitado en este momento.",
    hint: "Es un problema de configuración del sistema. Por favor contáctanos para reportarlo.",
  },
  "auth/app-not-authorized": {
    message: "Esta aplicación no está autorizada para usar la autenticación.",
    hint: "Es un problema de configuración del sistema. Por favor contáctanos para reportarlo.",
  },
  "auth/unauthorized-domain": {
    message: "Este sitio no está autorizado para verificar números de teléfono.",
    hint: "Es un problema de configuración del sistema. Por favor contáctanos para reportarlo.",
  },
  "auth/web-storage-unsupported": {
    message: "Tu navegador no permite el almacenamiento necesario para verificar tu teléfono.",
    hint: "Desactiva la navegación privada/incógnito o el bloqueo de cookies para este sitio y vuelve a intentarlo.",
  },
  "auth/invalid-app-credential": {
    message: "No se pudo verificar la aplicación para enviar el código.",
    hint: "Recarga la página e inténtalo de nuevo. Si el problema persiste, contáctanos.",
  },
  "auth/argument-error": {
    message: "Ocurrió un error con los datos enviados.",
    hint: "Recarga la página e inténtalo nuevamente.",
  },
  "auth/internal-error": {
    message: "Ocurrió un error interno al procesar la solicitud.",
    hint: "Intenta nuevamente en unos momentos. Si el problema continúa, contáctanos.",
  },

  // ─── Correo y contraseña (usados en otros flujos de auth) ────────────
  "auth/wrong-password": {
    message: "Contraseña incorrecta.",
    hint: "Verifica tu contraseña o usa la opción \"¿Olvidaste tu contraseña?\" para restablecerla.",
  },
  "auth/email-already-in-use": {
    message: "Este correo electrónico ya está en uso.",
    hint: "Inicia sesión con ese correo o usa uno diferente para registrarte.",
  },
  "auth/weak-password": {
    message: "La contraseña es demasiado débil.",
    hint: "Usa al menos 6 caracteres, combinando letras y números.",
  },
  "auth/invalid-email": {
    message: "El correo electrónico no es válido.",
    hint: "Revisa que el correo esté bien escrito (ej: nombre@dominio.com).",
  },
  "auth/invalid-credential": {
    message: "Los datos de acceso son incorrectos o expiraron.",
    hint: "Verifica tu correo y contraseña, o vuelve a intentar el inicio de sesión.",
  },

  // ─── Google / popups ───────────────────────────────────────────────────
  "auth/popup-closed-by-user": {
    message: "La ventana de autenticación se cerró antes de terminar.",
    hint: "Vuelve a intentarlo y no cierres la ventana emergente hasta completar el proceso.",
  },
  "auth/cancelled-popup-request": {
    message: "La operación de autenticación fue cancelada.",
    hint: "Vuelve a intentarlo. Si abriste varias ventanas de inicio de sesión, cierra las demás primero.",
  },
  "auth/popup-blocked": {
    message: "El navegador bloqueó la ventana de autenticación.",
    hint: "Permite ventanas emergentes para este sitio en tu navegador y vuelve a intentarlo.",
  },
};

export const DEFAULT_AUTH_ERROR_MESSAGE: AuthErrorMessage = {
  message: "Ha ocurrido un error inesperado.",
  hint: "Inténtalo nuevamente. Si el problema persiste, contáctanos para ayudarte.",
};
