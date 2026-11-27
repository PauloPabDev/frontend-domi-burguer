"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Modal } from "@/components/ui/modal";
import { useConsentStore } from "@/store/consentStore";
import { FloatingPrompt } from "@/components/prompts/FloatingPrompt";
import { usePromptSlot } from "@/hooks/usePromptSlot";
import { trackPrompt } from "@/utils/analytics";

export function CookieConsent() {
  const { analytics, settingsOpen, setAnalytics, openSettings, closeSettings } = useConsentStore();
  const [draft, setDraft] = useState(false);

  const visible = usePromptSlot("cookies", analytics === null);
  useEffect(() => {
    if (settingsOpen) setDraft(analytics === true);
  }, [settingsOpen, analytics]);

  const decide = (value: boolean, via?: string) => {
    // Umami no usa cookies ni datos personales, por eso puede medir la decisión.
    trackPrompt("cookies", value ? "accepted" : "dismissed", via);
    setAnalytics(value);
  };

  return (
    <>
      {visible && !settingsOpen && (
        <FloatingPrompt
          title="Cookies"
          description={
            <>
              Usamos cookies analíticas para entender cómo usas Domi Burguer y mejorarla.{" "}
              <Link href="/legal#politicas" className="underline font-semibold">
                Más info
              </Link>
            </>
          }
          closeLabel="Cerrar y rechazar"
          onClose={() => decide(false, "close")}
          actions={
            <>
              <Button variant="primary" size="sm" onClick={() => decide(true)}>
                Aceptar
              </Button>
              <Button variant="outline" size="sm" onClick={() => decide(false, "reject")}>
                Rechazar
              </Button>
              <button
                type="button"
                onClick={openSettings}
                className="ml-auto text-xs font-semibold text-neutral-600 underline hover:text-neutral-black-80"
              >
                Configurar
              </button>
            </>
          }
        />
      )}

      <Modal
        open={settingsOpen}
        onOpenChange={(open) => !open && closeSettings()}
        title="Preferencias de cookies"
        description="Tú decides qué podemos medir. Puedes cambiarlo cuando quieras desde el pie de página."
        footer={false}
        size="md"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-sm">Necesarias</p>
              <p className="text-xs text-neutral-600">Mantienen tu sesión, el carrito y tus preferencias. Siempre activas.</p>
            </div>
            <Switch checked disabled aria-label="Cookies necesarias" />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-sm">Analíticas (Microsoft Clarity)</p>
              <p className="text-xs text-neutral-600">
                Mapas de calor y grabaciones anónimas de la navegación para detectar qué mejorar. Los campos de formulario van enmascarados.
              </p>
            </div>
            <Switch checked={draft} onCheckedChange={setDraft} aria-label="Cookies analíticas" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => decide(false)}>
              Rechazar todo
            </Button>
            <Button variant="primary" size="sm" onClick={() => decide(draft)}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
