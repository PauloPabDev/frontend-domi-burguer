"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Star, ChevronDown, ChevronRight, Plus, Minus, Trophy, Check, Copy } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserPoints } from "@/hooks/useUserPoints";
import { POINT_FLOW_TYPES, Point } from "@/types/points";
import { useAuth } from "@/contexts/AuthContext";
import { getIdToken } from "firebase/auth";
import { CodesService } from "@/services/codesService";
import { Code } from "@/types/codes";
import { Modal } from "@/components/ui/modal";
import { addToast } from "@heroui/toast";
import { copyToClipboard } from "@/utils/clipboard";
import { formatFirebaseTimestamp } from "@/utils/dateFormatters";

export function PointsSection() {
    const { userProfile, loading: loadingProfile } = useUserProfile();
    const { points, loading: loadingPoints } = useUserPoints();
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimedCode, setClaimedCode] = useState<Code | null>(null);
    const [codeCopied, setCodeCopied] = useState(false);

    const loading = loadingProfile || loadingPoints;
    const balance = userProfile?.pointsBalance ?? 0;

    const handleClaim = async () => {
        if (!user) return;
        setIsClaiming(true);
        try {
            const token = await getIdToken(user);
            const response = await CodesService.claimOfPrizes(token);
            setClaimedCode(response.body);
            setShowClaimModal(false);
        } catch (err) {
            addToast({
                title: "Error",
                description: (err as Error).message,
                color: "danger",
                variant: "solid",
            });
        } finally {
            setIsClaiming(false);
        }
    };

    const handleCopyCode = async () => {
        if (!claimedCode) return;
        const success = await copyToClipboard(claimedCode.code);
        if (success) {
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        }
    };

    return (
        <div className="mb-8">
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wide mb-4">
                MIS PUNTOS
            </h2>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Sección principal de puntos */}
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Star className="w-5 h-5 text-neutral-500" />
                            <div>
                                <p className="font-medium text-neutral-800">
                                    {loading ? (
                                        <Loader2 className="animate-spin w-5 h-5 text-neutral-400" />
                                    ) : (
                                        <>{balance} puntos</>
                                    )}
                                </p>
                                <p className="text-xs text-neutral-500">
                                    Pronto podrás canjear tus puntos por premios
                                </p>
                            </div>
                        </div>
                        <button
                            disabled
                            className="flex items-center gap-1 opacity-50 cursor-not-allowed"
                        >
                            <span className="text-xs text-neutral-400">Próximamente</span>
                            <ChevronRight className="w-5 h-5 text-neutral-400" />
                        </button>
                    </div>

                    {/* Banner para reclamar combo gratis */}
                    {!loading && balance >= 199 && !claimedCode && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                <p className="text-sm text-amber-800 font-medium">
                                    ¡Tienes suficientes puntos para reclamar un combo gratis!
                                </p>
                            </div>
                            <button
                                onClick={() => setShowClaimModal(true)}
                                className="text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                                RECLAMAR
                            </button>
                        </div>
                    )}

                    {/* Código reclamado */}
                    {claimedCode && (
                        <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                ¡Código de combo gratis generado!
                            </p>
                            <div className="flex items-center justify-between bg-white border border-green-300 rounded-lg px-4 py-3">
                                <span className="text-xl font-bold tracking-widest text-neutral-800">
                                    {claimedCode.code}
                                </span>
                                <button
                                    onClick={handleCopyCode}
                                    className="p-1 text-neutral-500 hover:text-neutral-700 transition-colors"
                                    aria-label="Copiar código"
                                >
                                    {codeCopied ? (
                                        <Check className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Copy className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {claimedCode.expirationDate && (
                                <p className="text-xs text-neutral-500 mt-2">
                                    Válido hasta: {new Date(claimedCode.expirationDate).toLocaleDateString("es-ES")}
                                </p>
                            )}
                            <p className="text-xs text-neutral-400 mt-1">
                                Usa este código al finalizar tu pedido. También lo encontrarás en <strong>Mis Códigos</strong>.
                            </p>
                        </div>
                    )}
                </div>

                {/* Botón desplegable para historial */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-center gap-2 py-3 border-t border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                    <span className="text-sm text-neutral-600">
                        {isExpanded ? "Ocultar historial" : "Ver historial de puntos"}
                    </span>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <ChevronDown className="w-4 h-4 text-neutral-500" />
                    </motion.div>
                </button>

                {/* Lista de historial con animación */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                                height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                                opacity: { duration: 0.2, ease: "easeInOut" },
                            }}
                            className="border-t border-gray-200 overflow-hidden"
                        >
                            {points.length === 0 ? (
                                <p className="p-4 text-sm text-neutral-500 text-center">
                                    No hay registros de puntos
                                </p>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {points.map((record: Point, index: number) => (
                                        <motion.div
                                            key={record.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                duration: 0.3,
                                                delay: index * 0.05,
                                                ease: [0.4, 0, 0.2, 1],
                                            }}
                                            className="p-4 flex items-center justify-between"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-neutral-800 truncate">
                                                    {record.description}
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    {formatFirebaseTimestamp(record.createdAt)}
                                                </p>
                                            </div>
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{
                                                    duration: 0.2,
                                                    delay: index * 0.05 + 0.1,
                                                }}
                                                className="flex items-center gap-1 ml-4"
                                            >
                                                {record.flowType === POINT_FLOW_TYPES.INPUT && (
                                                    <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                                                        <Plus className="w-3 h-3" />
                                                        {record.points}
                                                    </span>
                                                )}
                                                {record.flowType === POINT_FLOW_TYPES.OUTPUT && (
                                                    <span className="flex items-center gap-1 text-sm font-medium text-red-500">
                                                        <Minus className="w-3 h-3" />
                                                        {record.points}
                                                    </span>
                                                )}
                                            </motion.div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modal de confirmación para reclamar combo */}
            <Modal
                open={showClaimModal}
                onOpenChange={(open) => !open && setShowClaimModal(false)}
                title="Reclamar combo de premio"
                headerIcon={<Trophy className="w-8 h-8 text-amber-500" />}
                size="md"
                footer={{
                    cancel: { label: "CANCELAR" },
                    confirm: {
                        label: "ACEPTAR Y RECLAMAR",
                        onClick: handleClaim,
                        loading: isClaiming,
                        loadingText: "Reclamando...",
                    },
                }}
            >
                <div className="space-y-3 text-sm text-neutral-700">
                    <p>¿Deseas reclamar tu <strong>combo gratis</strong> usando tus puntos acumulados?</p>
                    <p className="text-neutral-500">Se generará un código único que podrás usar en tu próximo pedido.</p>
                </div>
            </Modal>
        </div>
    );
}
