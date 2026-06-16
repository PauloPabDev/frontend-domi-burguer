"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "../ui/icons";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/utils/analytics";

interface GoogleLoginProps {
    onClose: () => void;
    onSuccess?: () => void;
    redirectTo?: string;
    variant?: "default" | "outline";
    className?: string;
}

/**
 * Componente de inicio de sesión con Google
 */
export const GoogleLogin = ({
    onClose,
    onSuccess,
    redirectTo = "/profile",
    variant = "outline",
    className = ""
}: GoogleLoginProps) => {
    const router = useRouter();
    const { signInWithGoogle, clearError } = useAuth();

    const handleGoogleSignIn = async () => {
        track('google_signin_clicked');
        try {
            clearError();
            await signInWithGoogle();

            // Si hay un callback de éxito, llamarlo
            if (onSuccess) onSuccess();

            // Cerrar el modal y redirigir
            onClose();
            if (redirectTo) router.push(redirectTo);
        } catch (error) {
            console.error("Error al iniciar sesión con Google:", error);
        }
    };

    return (
        <Button
            variant={variant}
            onClick={handleGoogleSignIn}
            className={`text-neutral-black-80 hover:text-neutral-black-60 rounded-[30px] flex items-center gap-2 text-[16px] w-full h-[48px] ${className}`}
        >
            <GoogleIcon />
        </Button>
    );
};
