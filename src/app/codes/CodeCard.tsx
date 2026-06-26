"use client";

import { useState } from "react";
import { Code } from "@/types/codes";
import { Pencil, Trash2, Hash, Share2, Check, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ConfirmModal } from "@/components/ui/modal/presets/ConfirmModal";
import { addToast } from "@heroui/toast";
import Link from "next/link";
import { copyToClipboard } from "@/utils/clipboard";

interface CodeCardProps {
    code: Code;
    onDelete: (codeId: string) => void;
    onToggleStatus: (code: Code) => void;
}

const codeTypeLabels: Record<string, string> = {
    referral: "Referido",
    promotional: "Promocional",
    loyalty: "Fidelidad",
    claim_of_prizes: "Premio",
};

const codeTypeBadge: Record<string, string> = {
    referral: "bg-blue-100 text-blue-700",
    promotional: "bg-purple-100 text-purple-700",
    loyalty: "bg-orange-100 text-orange-700",
    claim_of_prizes: "bg-amber-100 text-amber-700",
};

export function CodeCard({ code, onDelete, onToggleStatus }: CodeCardProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copied, setCopied] = useState(false);

    const isExpired = code.expirationDate && new Date(code.expirationDate) < new Date();

    const handleShareCode = async () => {
        const referralUrl = `${window.location.origin}/referral/${code.code}`;
        const shareData = {
            title: "Código de referido Domi Burguer",
            text: `¡Usa mi código ${code.code} en tu primer pedido en Domi Burguer y obtén una porción de papas GRATIS!🍟`,
            url: referralUrl,
        };
        console.log("Intentando compartir con datos:", shareData);
        // Verificar si Web Share API está disponible y puede compartir estos datos
        const canShare = typeof navigator.share === "function" &&
            typeof navigator.canShare === "function" &&
            navigator.canShare(shareData);

        if (canShare) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                // Si el usuario cancela o hay error, intentar copiar
                if ((err as Error).name === "AbortError") {
                    return;
                }
            }
        }

        // Fallback: copiar al portapapeles
        const success = await copyToClipboard(referralUrl);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            addToast({
                title: "Enlace copiado",
                description: "El enlace de tu código de referido ha sido copiado",
                variant: "solid",
                color: "success",
            });
        } else {
            addToast({
                title: "Error",
                description: "No se pudo copiar el enlace",
                variant: "solid",
                color: "danger",
            });
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(code.id);
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <>
            <ConfirmModal
                open={showDeleteModal}
                onOpenChange={setShowDeleteModal}
                title="Eliminar código"
                message={`¿Estás seguro de que deseas eliminar el código "${code.code}"?`}
                onConfirm={handleDelete}
                confirmText="ELIMINAR"
                cancelText="CANCELAR"
                destructive
                loading={isDeleting}
            />
            <div className="flex items-start justify-between py-4 gap-4 border-b border-gray-200 last:border-b-0">
                {code.type === "referral" ? (
                    <Link
                        href={`/referral/${code.code}`}
                        className="flex-1 flex items-center gap-2 group cursor-pointer hover:bg-gray-50 rounded-lg -m-2 p-2 transition-colors"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-neutral-800 text-base group-hover:text-primary-red transition-colors">
                                    {code.code}
                                </h3>
                                <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                                    {codeTypeLabels[code.type]}
                                </span>
                            </div>
                            {code.description && (
                                <p className="text-sm text-neutral-600 mt-1">{code.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                                <span className="flex items-center gap-1">
                                    <Hash className="w-3 h-3" />
                                    Usos: {code.usageCount}{code.usageLimit ? ` / ${code.usageLimit}` : ""}
                                </span>
                                {isExpired && (
                                    <span className="text-red-500">Expirado</span>
                                )}
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-red transition-colors" />
                    </Link>
                ) : (
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-neutral-800 text-base">
                                {code.code}
                            </h3>
                            <span
                                className={`px-2 py-0.5 rounded text-xs ${codeTypeBadge[code.type] ?? "bg-gray-100 text-gray-600"}`}
                            >
                                {codeTypeLabels[code.type]}
                            </span>
                        </div>
                        {code.description && (
                            <p className="text-sm text-neutral-600 mt-1">{code.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                            <span className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                Usos: {code.usageCount}{code.usageLimit ? ` / ${code.usageLimit}` : ""}
                            </span>
                            {isExpired && (
                                <span className="text-red-500">Expirado</span>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    {code.type === "referral" && (
                        <button
                            onClick={handleShareCode}
                            className="p-2 text-primary-red hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Compartir código"
                            title="Copiar enlace de referido"
                        >
                            {copied ? (
                                <Check className="w-5 h-5 text-green-500" />
                            ) : (
                                <Share2 className="w-5 h-5" />
                            )}
                        </button>
                    )}
                    <Switch
                        checked={code.status === "active"}
                        onCheckedChange={() => onToggleStatus(code)}
                        disabled
                    />
                    <button
                        disabled
                        className="p-2 text-neutral-300 cursor-not-allowed"
                        aria-label="Editar código"
                    >
                        <Pencil className="w-5 h-5" />
                    </button>
                    <button
                        disabled
                        className="p-2 text-neutral-300 cursor-not-allowed"
                        aria-label="Eliminar código"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </>
    );
}
