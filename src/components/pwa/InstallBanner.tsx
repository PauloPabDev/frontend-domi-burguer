"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { track } from "@/utils/analytics";
import { LogoMobile } from "@/components/ui/icons";

export function InstallBanner() {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    track('pwa_banner_dismissed');
    setIsDismissed(true);
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString());
  };

  const handleInstall = async () => {
    track('pwa_install_clicked');
    const success = await installApp();
    if (success) {
      track('pwa_installed');
      setIsDismissed(true);
    }
  };

  if (!mounted || !isInstallable || isInstalled || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[500] mx-auto max-w-md">
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-4 flex items-center gap-4">
        <div className="flex-shrink-0">
          <LogoMobile width={40} height={56} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-neutral-black-80">
            Instala Domi Burguer
          </p>
          <p className="text-xs text-neutral-600 mt-0.5">
            Accede rapido y ordena sin abrir el navegador
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleInstall}
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Instalar</span>
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
