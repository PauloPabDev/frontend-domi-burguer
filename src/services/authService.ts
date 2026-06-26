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

/**
 * Interfaz de error de autenticación
 */
export interface AuthError {
  code: string;
  message: string;
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
   * Formatear errores de Firebase Auth para hacerlos más amigables
   */
  private static formatError(error: unknown): AuthError {
    // Convertir error desconocido a un tipo que podamos manejar
    const firebaseError = error as FirebaseAuthError;
    const errorCode = firebaseError.code || 'unknown';
    
    // Mapeo de códigos de error a mensajes más amigables
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'No existe una cuenta con este correo electrónico.',
      'auth/wrong-password': 'Contraseña incorrecta.',
      'auth/email-already-in-use': 'Este correo electrónico ya está en uso.',
      'auth/weak-password': 'La contraseña es demasiado débil.',
      'auth/invalid-email': 'El correo electrónico no es válido.',
      'auth/invalid-verification-code': 'El código de verificación no es válido.',
      'auth/code-expired': 'El código de verificación ha expirado.',
      'auth/invalid-phone-number': 'El número de teléfono no es válido.',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Inténtelo más tarde.',
      'auth/popup-closed-by-user': 'La ventana de autenticación se cerró.',
      'auth/cancelled-popup-request': 'La operación de autenticación fue cancelada.',
    };

    return {
      code: errorCode,
      message: errorMessages[errorCode] || firebaseError.message || 'Ha ocurrido un error de autenticación.'
    };
  }
}
