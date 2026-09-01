"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthService, AuthError } from '@/services/authService';

/**
 * Interface que define los datos y métodos disponibles en el contexto de autenticación
 */
interface AuthContextType {
    // Datos del usuario
    user: User | null;
    loading: boolean;

    // Métodos de autenticación con correo/contraseña
    signIn: (email: string, password: string) => Promise<User>;
    signUp: (email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;

    // Autenticación con Google
    signInWithGoogle: () => Promise<User>;

    // Autenticación con teléfono
    phoneSignIn: {
        sendVerificationCode: (phoneNumber: string, recaptchaContainerId: string) => Promise<ConfirmationResult>;
        verifyCode: (confirmationResult: ConfirmationResult, code: string) => Promise<User>;
        linkPhoneToAccount: (verificationId: string, verificationCode: string) => Promise<User>;
    };

    // Recargar datos del usuario
    reloadUser: () => Promise<void>;

    // Estado del error
    error: AuthError | null;
    clearError: () => void;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook para acceder al contexto de autenticación
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

/**
 * Proveedor del contexto de autenticación
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // Estado del usuario y carga
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AuthError | null>(null);

    // Escuchar cambios en el estado de autenticación
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Limpiar error
    const clearError = () => setError(null);

    /**
     * Manejador de errores genérico
     */
    const handleAuthError = (error: unknown) => {
        if ((error as AuthError).code && (error as AuthError).message) {
            setError(error as AuthError);
            throw error;
        } else {
            const genericError: AuthError = {
                code: 'auth/unknown',
                message: 'Ha ocurrido un error inesperado',
                hint: 'Inténtalo nuevamente. Si el problema persiste, contáctanos para ayudarte.',
            };
            setError(genericError);
            throw genericError;
        }
    };

    /**
     * Iniciar sesión con correo y contraseña
     */
    const signIn = async (email: string, password: string): Promise<User> => {
        try {
            clearError();
            const result = await AuthService.signInWithEmail(email, password);
            return result.user;
        } catch (error) {
            return handleAuthError(error);
        }
    };

    /**
     * Registrarse con correo y contraseña
     */
    const signUp = async (email: string, password: string): Promise<User> => {
        try {
            clearError();
            const result = await AuthService.signUpWithEmail(email, password);
            return result.user;
        } catch (error) {
            return handleAuthError(error);
        }
    };

    /**
     * Cerrar sesión
     */
    const logout = async (): Promise<void> => {
        try {
            clearError();
            await AuthService.signOut();
        } catch (error) {
            handleAuthError(error);
        }
    };

    /**
     * Restablecer contraseña
     */
    const resetPassword = async (email: string): Promise<void> => {
        try {
            clearError();
            await AuthService.resetPassword(email);
        } catch (error) {
            handleAuthError(error);
        }
    };

    /**
     * Iniciar sesión con Google
     */
    const signInWithGoogle = async (): Promise<User> => {
        try {
            clearError();
            const result = await AuthService.signInWithGoogle();
            return result.user;
        } catch (error) {
            return handleAuthError(error);
        }
    };

    /**
     * Autenticación con teléfono
     */
    const phoneSignIn = {
        // Enviar código de verificación
        sendVerificationCode: async (phoneNumber: string, recaptchaContainerId: string): Promise<ConfirmationResult> => {
            try {
                clearError();
                const recaptchaVerifier = AuthService.createRecaptchaVerifier(recaptchaContainerId);
                return await AuthService.sendPhoneVerificationCode(phoneNumber, recaptchaVerifier);
            } catch (error) {
                return handleAuthError(error);
            }
        },

        // Verificar código
        verifyCode: async (confirmationResult: ConfirmationResult, code: string): Promise<User> => {
            try {
                clearError();
                const result = await AuthService.verifyPhoneCode(confirmationResult, code);
                return result.user;
            } catch (error) {
                return handleAuthError(error);
            }
        },

        // Vincular teléfono a cuenta existente
        linkPhoneToAccount: async (verificationId: string, verificationCode: string): Promise<User> => {
            try {
                clearError();
                if (!user) {
                    throw {
                        code: 'auth/no-user',
                        message: 'No hay usuario autenticado.',
                        hint: 'Inicia sesión y vuelve a intentar vincular tu teléfono.',
                    };
                }
                const result = await AuthService.linkPhoneToAccount(user, '', verificationId, verificationCode);
                // Recargar el usuario para obtener el phoneNumber actualizado
                await result.user.reload();
                setUser(result.user);
                return result.user;
            } catch (error) {
                return handleAuthError(error);
            }
        }
    };

    /**
     * Recargar datos del usuario actual
     */
    const reloadUser = async (): Promise<void> => {
        if (user) {
            await user.reload();
            // Forzar actualización del estado
            setUser(auth.currentUser);
        }
    };

    // Valor que se proporcionará al contexto
    const value: AuthContextType = {
        user,
        loading,
        signIn,
        signUp,
        logout,
        resetPassword,
        signInWithGoogle,
        phoneSignIn,
        reloadUser,
        error,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};