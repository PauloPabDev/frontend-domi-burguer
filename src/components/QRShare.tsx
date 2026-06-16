"use client";

import { useRef, useState } from "react";
import { track } from "@/utils/analytics";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Share2, Check } from "lucide-react";
import { addToast } from "@heroui/toast";

interface QRShareProps {
    url: string;
    title?: string;
    fileName?: string;
}

export function QRShare({ url, title = "Código QR", fileName = "qr-code" }: QRShareProps) {
    const qrRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    const getQRCanvas = (): HTMLCanvasElement | null => {
        if (!qrRef.current) return null;
        return qrRef.current.querySelector("canvas");
    };

    const handleDownload = () => {
        const canvas = getQRCanvas();
        if (!canvas) return;

        const link = document.createElement("a");
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        track('qr_downloaded', { file_name: `${fileName}.png` });

        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2000);

        addToast({
            title: "QR descargado",
            description: "El código QR se ha guardado en tu dispositivo",
            variant: "flat",
            color: "primary",
        });
    };

    const handleShare = async () => {
        const canvas = getQRCanvas();
        if (!canvas) return;

        setIsSharing(true);

        try {
            // Convertir canvas a blob
            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, "image/png");
            });

            if (!blob) {
                throw new Error("No se pudo generar la imagen");
            }

            const file = new File([blob], `${fileName}.png`, { type: "image/png" });

            // Verificar si Web Share API puede compartir archivos
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: title,
                    text: `Escanea este código QR: ${url}`,
                    files: [file],
                });
                track('qr_shared', { method: 'web_share_api_files' });
            } else if (navigator.share) {
                // Fallback: compartir solo el enlace
                await navigator.share({
                    title: title,
                    text: `Escanea este código QR o visita: ${url}`,
                    url: url,
                });
                track('qr_shared', { method: 'web_share_api_url' });
            } else {
                // Fallback para navegadores sin Web Share API: descargar
                handleDownload();
            }
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                addToast({
                    title: "Error",
                    description: "No se pudo compartir el código QR",
                    variant: "solid",
                    color: "danger",
                });
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            {/* Descripción */}
            <p className="text-sm text-gray-500 text-center mb-4">{title}</p>

            {/* QR Code con borde */}
            <div
                ref={qrRef}
                className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm mb-5"
            >
                <QRCodeCanvas
                    value={url}
                    size={160}
                    level="H"
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#000000"
                />
            </div>

            {/* Botones en fila */}
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={handleDownload}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Descargar QR"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {downloaded ? (
                            <Check className="w-5 h-5 text-green-500" />
                        ) : (
                            <Download className="w-5 h-5 text-gray-700" />
                        )}
                    </div>
                    <span className="text-xs text-gray-600">Descargar</span>
                </button>

                <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    title="Compartir QR"
                >
                    <div className="w-10 h-10 rounded-full bg-primary-red flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-gray-600">Compartir</span>
                </button>
            </div>
        </div>
    );
}
