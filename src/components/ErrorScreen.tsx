"use client";

import { ArrowLeft, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/icons";

// Pantalla de error con la estética de Domi Burguer (usada por error.tsx y global-error.tsx)
export function ErrorScreen({ digest }: { digest?: string }) {
    // Se arma al hacer clic (no en el render) porque este componente también puede renderizarse en el servidor
    const handleReport = () => {
        const text = `Hola, me salió un error en la página ${window.location.pathname}${digest ? ` (código ${digest})` : ""}`;
        window.open(`https://wa.me/573506186772?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center gap-6">
            <div className="text-7xl" aria-hidden>🍔</div>

            <div className="flex flex-col gap-2 max-w-sm">
                <h1>Ocurrió un error</h1>
                <p className="body-font text-neutral-black-50">
                    Algo salió mal al cargar esta página. Por favor retrocede, vuelve a recargar o reporta el problema.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-none sm:justify-center">
                <Button variant="outline" size="lg" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => window.history.back()}>
                    Retroceder
                </Button>
                <Button variant="primary" size="lg" leftIcon={<RotateCw className="w-4 h-4" />} onClick={() => window.location.reload()}>
                    Recargar
                </Button>
            </div>

            <button
                type="button"
                onClick={handleReport}
                className="flex items-center gap-2 body-font text-neutral-black-50 hover:text-neutral-black-80 transition-colors cursor-pointer"
            >
                <WhatsAppIcon width={18} height={18} />
                Reportar problema
            </button>
        </div>
    );
}
