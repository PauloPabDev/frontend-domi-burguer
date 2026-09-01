import { 
  User,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  UserCredential,
  ConfirmationResult,
  linkWithCredential,
  AuthError as FirebaseAuthError
} from 'firebase/auth';

import { auth } from '@/lib/firebase';
import { AUTH_ERROR_MESSAGES, DEFAULT_AUTH_ERROR_MESSAGE } from '@/utils/constants/authErrorMessages';

/**
 * Interfaz de error de autenticación
 */
export interface AuthError {
  code: string;
  message: string;
  /** Instrucciones de cómo solucionar el error, para mostrar al usuario. */
  hint?: string;
}

/**
 * Servicio de autenticación para gestionar todas las operaciones con Firebase Auth
 */
export class AuthService {
  /**
   * Iniciar sesión con correo y contraseña
   */
  static async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      console.error('Error signing in with email:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Registrarse con correo y contraseña
   */
  static async signUpWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      console.error('Error signing up with email:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Iniciar sesión con Google
   */
  static async signInWithGoogle(): Promise<UserCredential> {
    try {
      const provider = new GoogleAuthProvider();
      return await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      console.error('Error signing in with Google:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Enviar código de verificación al teléfono
   */
  static async sendPhoneVerificationCode(
    phoneNumber: string, 
    recaptchaVerifier: RecaptchaVerifier
  ): Promise<ConfirmationResult> {
    try {
      return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    } catch (error: unknown) {
      console.error('Error sending phone verification code:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Verificar código telefónico
   */
  static async verifyPhoneCode(
    confirmationResult: ConfirmationResult, 
    code: string
  ): Promise<UserCredential> {
    try {
      return await confirmationResult.confirm(code);
    } catch (error: unknown) {
      console.error('Error verifying phone code:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Vincular una cuenta telefónica con un usuario existente
   */
  static async linkPhoneToAccount(
    user: User,
    _phoneNumber: string,
    verificationId: string,
    verificationCode: string
  ): Promise<UserCredential> {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      return await linkWithCredential(user, credential);
    } catch (error: unknown) {
      console.error('Error linking phone to account:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Cerrar sesión
   */
  static async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: unknown) {
      console.error('Error signing out:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Enviar correo para restablecer contraseña
   */
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      console.error('Error resetting password:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Crear instancia de RecaptchaVerifier
   */
  static createRecaptchaVerifier(
    containerId: string, 
    callbacks?: {
      success?: () => void;
      error?: (error: unknown) => void;
      expired?: () => void;
    }
  ): RecaptchaVerifier {
    return new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: callbacks?.success,
      'expired-callback': callbacks?.expired
    });
  }

  /**
   * Formatear errores de Firebase Auth para hacerlos más amigables.
   * Usa el mapa centralizado de mensajes en español (con instrucciones de
   * cómo solucionarlos) en vez de mostrar el texto crudo de Firebase.
   */
  private static formatError(error: unknown): AuthError {
    // Convertir error desconocido a un tipo que podamos manejar
    const firebaseError = error as FirebaseAuthError;
    const errorCode = firebaseError.code || 'auth/unknown';
    const detail = AUTH_ERROR_MESSAGES[errorCode];

    return {
      code: errorCode,
      message: detail?.message || firebaseError.message || DEFAULT_AUTH_ERROR_MESSAGE.message,
      hint: detail?.hint || DEFAULT_AUTH_ERROR_MESSAGE.hint,
    };
  }
}
