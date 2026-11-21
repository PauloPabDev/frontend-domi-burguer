"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogoMobile } from "@/components/ui/icons";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export function GoogleSignInBanner() {
  const { user, loading, signInWithGoogle } = useAuth();
  const { isInstallable, isInstalled } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [pwaBannerDismissed, setPwaBannerDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = localStorage.getItem("google-signin-banner-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Mostrar de nuevo después de 3 días
      if (Date.now() - dismissedTime < 3 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }
    // Verificar si el banner de PWA fue descartado
    const pwaDismissed = localStorage.getItem("pwa-banner-dismissed");
    if (pwaDismissed) {
      const dismissedTime = parseInt(pwaDismissed, 10);
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setPwaBannerDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("google-signin-banner-dismissed", Date.now().toString());
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      setIsDismissed(true);
      localStorage.setItem("google-signin-banner-dismissed", Date.now().toString());
    } catch (error) {
      console.error("Error signing in with Google:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Verificar si el banner de PWA está visible (instalable y no descartado)
  const isPwaBannerVisible = isInstallable && !isInstalled && !pwaBannerDismissed;

  // No mostrar si: no está montado, está cargando, ya hay usuario, fue descartado, o el banner de PWA está visible
  if (!mounted || loading || user || isDismissed || isPwaBannerVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-28 lg:bottom-4 left-4 right-4 z-[500] mx-auto max-w-md">
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-4 flex items-center gap-4">
        <div className="flex-shrink-0">
          <LogoMobile width={40} height={56} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-neutral-black-80">
            Inicia sesión y acumula puntos

          </p>
          <p className="text-xs text-neutral-600 mt-0.5">
            {/* Y acumula puntos */}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSignIn}
            variant="outline"
            size="sm"
            leftIcon={<GoogleIcon />}
            disabled={isSigningIn}
          >
            <span className="hidden sm:inline">
              {isSigningIn ? "..." : "Google"}
            </span>
          </Button>

          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
