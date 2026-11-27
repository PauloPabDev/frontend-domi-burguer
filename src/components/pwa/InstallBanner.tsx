"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingPrompt } from "@/components/prompts/FloatingPrompt";
import { useDismissal, usePromptSlot } from "@/hooks/usePromptSlot";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { track, trackPrompt } from "@/utils/analytics";

export function InstallBanner() {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [dismissed, dismiss] = useDismissal("pwa-banner-dismissed", 7);
  const visible = usePromptSlot("install", isInstallable && !isInstalled && !dismissed);

  const handleClose = () => {
    trackPrompt("install", "dismissed");
    dismiss();
  };

  const handleInstall = async () => {
    track("pwa_install_clicked");
    if (await installApp()) {
      track("pwa_installed");
      trackPrompt("install", "accepted");
      dismiss();
    }
  };

  if (!visible) return null;

  return (
    <FloatingPrompt
      title="Instala Domi Burguer"
      description="Accede rápido y ordena sin abrir el navegador."
      onClose={handleClose}
      actions={
        <Button onClick={handleInstall} variant="primary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
          Instalar
        </Button>
      }
    />
  );
}
