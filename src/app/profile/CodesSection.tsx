"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Code } from "@/types/codes";
import { CodesService } from "@/services/codesService";
import { getIdToken } from "firebase/auth";
import {
    Loader2, Gift, Share2, Check, Hash, ChevronRight,
    Trophy, Info, ShoppingCart, Calendar, Tag, X,
} from "lucide-react";
import { UserCodeModal } from "@/app/codes/UserCodeModal";
import { addToast } from "@heroui/toast";
import { useAppliedCodeStore } from "@/store/appliedCodeStore";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { copyToClipboard } from "@/utils/clipboard";

const CODE_PREVIEW_LIMIT = 3;

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

const rewardTypeLabels: Record<string, string> = {
    discount: "Descuento",
    freeProduct: "Producto gratis",
    freeElement: "Elemento gratis",
    fixedPriceInElement: "Precio fijo en elemento",
};

export function CodesSection() {
    const { user } = useAuth();
    const [codes, setCodes] = useState<Code[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [detailCode, setDetailCode] = useState<Code | null>(null);

    const { setAppliedCode, appliedCode } = useAppliedCodeStore();

    const fetchCodes = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const token = await getIdToken(user);
            const response = await CodesService.getCodesByUser(token, user.uid);
            setCodes(response.body);
        } catch (err) {
            console.error("Error cargando códigos", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCodes();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const previewCodes = codes.slice(0, CODE_PREVIEW_LIMIT);
    const hasMore = codes.length > CODE_PREVIEW_LIMIT;

    const handleShare = async (code: Code) => {
        const referralUrl = `${window.location.origin}/referral/${code.code}`;
        const shareData = {
            title: "Código de referido Domi Burguer",
            text: `¡Usa mi código ${code.code} en tu primer pedido en Domi Burguer y obtén una porción de papas GRATIS!🍟`,
            url: referralUrl,
        };

        const canShare =
            typeof navigator.share === "function" &&
            typeof navigator.canShare === "function" &&
            navigator.canShare(shareData);

        if (canShare) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                if ((err as Error).name === "AbortError") return;
            }
        }

        const success = await copyToClipboard(referralUrl);
        if (success) {
            setCopied(code.id);
            setTimeout(() => setCopied(null), 2000);
            addToast({
                title: "Enlace copiado",
                description: "El enlace de tu código de referido ha sido copiado",
                variant: "solid",
                color: "success",
            });
        }
    };

    const handleUseCode = (code: Code) => {
        setAppliedCode(code);
        setDetailCode(null);
        addToast({
            title: "Código aplicado",
            description: `El código ${code.code} se usará en tu próximo pedido`,
            variant: "solid",
            color: "success",
        });
    };

    const isExpired = (code: Code) =>
        !!code.expirationDate && new Date(code.expirationDate) < new Date();

    return (
        <>
            <div className="mb-8">
                <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wide mb-4">
                    MIS CÓDIGOS
                </h2>

                {isLoading ? (
                    <div className="flex justify-center py-6">
                        <Loader2 className="animate-spin text-primary-red" size={32} />
                    </div>
                ) : codes.length === 0 ? (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <Gift className="w-5 h-5 text-neutral-500" />
                            <div className="text-left">
                                <p className="font-medium text-neutral-800">
                                    Crear mi código de referido
                                </p>
                                <p className="text-xs text-neutral-500">
                                    Invita amigos y gana beneficios
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-red transition-colors" />
                    </button>
                ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        {previewCodes.map((code) => (
                            <div key={code.id} className="border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center justify-between p-4 gap-3">
                                    {/* Ícono */}
                                    {code.type === "referral" ? (
                                        <Gift className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                                    ) : (
                                        <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                    )}

                                    {/* Info principal */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-bold text-neutral-800 tracking-wide">
                                                {code.code}
                                            </p>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${codeTypeBadge[code.type] ?? "bg-gray-100 text-gray-600"}`}>
                                                {codeTypeLabels[code.type] ?? code.type}
                                            </span>
                                            {isExpired(code) && (
                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-600">
                                                    Expirado
                                                </span>
                                            )}
                                            {appliedCode?.id === code.id && (
                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                                    En uso
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                                            <Hash className="w-3 h-3" />
                                            {code.usageCount} uso{code.usageCount !== 1 ? "s" : ""}
                                            {code.expirationDate && (
                                                <span className="ml-2 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Vence {new Date(code.expirationDate).toLocaleDateString("es-ES")}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {/* Compartir — solo referidos */}
                                        {code.type === "referral" && (
                                            <button
                                                onClick={() => handleShare(code)}
                                                className="p-1.5 text-neutral-400 hover:text-primary-red transition-colors rounded-lg hover:bg-red-50"
                                                aria-label="Compartir código"
                                            >
                                                {copied === code.id ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Share2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}

                                        {/* Ver detalles */}
                                        <button
                                            onClick={() => setDetailCode(code)}
                                            className="p-1.5 text-neutral-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                                            aria-label="Ver detalles"
                                        >
                                            <Info className="w-4 h-4" />
                                        </button>

                                        {/* Usar código */}
                                        <button
                                            onClick={() => handleUseCode(code)}
                                            disabled={isExpired(code) || code.status !== "active" || appliedCode?.id === code.id}
                                            className="p-1.5 text-neutral-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                            aria-label="Usar en el carrito"
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Botón Ver más */}
                        <Link
                            href="/codes"
                            className="w-full flex items-center justify-center gap-2 py-3 border-t border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-sm text-neutral-600 font-medium">
                                {hasMore ? `Ver todos mis códigos (${codes.length})` : "Ver mis códigos"}
                            </span>
                            <ChevronRight className="w-4 h-4 text-neutral-500" />
                        </Link>
                    </div>
                )}
            </div>

            {/* Modal de detalles del código */}
            <Modal
                open={!!detailCode}
                onOpenChange={(open) => !open && setDetailCode(null)}
                title="Detalles del código"
                headerIcon={
                    detailCode?.type === "referral"
                        ? <Gift className="w-8 h-8 text-blue-500" />
                        : <Trophy className="w-8 h-8 text-amber-500" />
                }
                size="md"
                footer={
                    detailCode && !isExpired(detailCode) && detailCode.status === "active" && appliedCode?.id !== detailCode.id
                        ? {
                            cancel: { label: "CERRAR", onClick: () => setDetailCode(null) },
                            confirm: {
                                label: "USAR EN MI PEDIDO",
                                onClick: () => detailCode && handleUseCode(detailCode),
                                icon: <ShoppingCart className="w-4 h-4" />,
                            },
                        }
                        : { cancel: { label: "CERRAR", onClick: () => setDetailCode(null) } }
                }
            >
                {detailCode && (
                    <div className="space-y-4">
                        {/* Código */}
                        <div className="flex items-center justify-center py-3 bg-neutral-50 rounded-xl border border-neutral-200">
                            <span className="text-2xl font-bold tracking-widest text-neutral-800">
                                {detailCode.code}
                            </span>
                        </div>

                        {/* Detalles en lista */}
                        <div className="space-y-2">
                            {/* Tipo */}
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                    <Tag className="w-4 h-4" />
                                    Tipo
                                </div>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${codeTypeBadge[detailCode.type] ?? "bg-gray-100 text-gray-600"}`}>
                                    {codeTypeLabels[detailCode.type] ?? detailCode.type}
                                </span>
                            </div>

                            {/* Estado */}
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                    <Info className="w-4 h-4" />
                                    Estado
                                </div>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${isExpired(detailCode)
                                    ? "bg-red-100 text-red-600"
                                    : detailCode.status === "active"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-500"
                                    }`}>
                                    {isExpired(detailCode) ? "Expirado" : detailCode.status === "active" ? "Activo" : "Inactivo"}
                                </span>
                            </div>

                            {/* Usos */}
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                    <Hash className="w-4 h-4" />
                                    Usos
                                </div>
                                <span className="text-sm font-medium text-neutral-700">
                                    {detailCode.usageCount}{detailCode.usageLimit ? ` / ${detailCode.usageLimit}` : ""}
                                </span>
                            </div>

                            {/* Expiración */}
                            {detailCode.expirationDate && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                                        <Calendar className="w-4 h-4" />
                                        Vence
                                    </div>
                                    <span className={`text-sm font-medium ${isExpired(detailCode) ? "text-red-600" : "text-neutral-700"}`}>
                                        {new Date(detailCode.expirationDate).toLocaleDateString("es-ES", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                            )}

                            {/* Premio */}
                            {detailCode.reward && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                                        <Trophy className="w-4 h-4" />
                                        Premio
                                    </div>
                                    <span className="text-sm font-medium text-neutral-700">
                                        {rewardTypeLabels[detailCode.reward.type] ?? detailCode.reward.type}
                                    </span>
                                </div>
                            )}

                            {/* Descripción */}
                            {detailCode.description && (
                                <div className="py-2">
                                    <p className="text-xs text-neutral-400 mb-1">Descripción</p>
                                    <p className="text-sm text-neutral-700">{detailCode.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Aviso si ya está en uso */}
                        {appliedCode?.id === detailCode.id && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                                <Check className="w-4 h-4 flex-shrink-0" />
                                Este código ya está aplicado a tu pedido.
                            </div>
                        )}

                        {/* Aviso si expirado */}
                        {isExpired(detailCode) && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                                <X className="w-4 h-4 flex-shrink-0" />
                                Este código ha expirado y ya no puede usarse.
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <UserCodeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchCodes}
            />
        </>
    );
}
