import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
    isLoading: boolean;
}

export function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
    // Bloquear scroll del body mientras está cargando
    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isLoading]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary-red" size={70} />
            <p className="text-white text-lg font-semibold">Procesando tu pedido...</p>
        </div>
    );
}