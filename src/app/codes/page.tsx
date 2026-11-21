"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Code } from "@/types/codes";
import { Loader2, Gift } from "lucide-react";
import { CodesService } from "@/services/codesService";
import { getIdToken } from "firebase/auth";
import { CodeCard } from "./CodeCard";
import { UserCodeModal } from "./UserCodeModal";

export default function CodesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [codes, setCodes] = useState<Code[]>([]);
    const [isLoadingCodes, setIsLoadingCodes] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const fetchCodes = async () => {
        if (!user) return;
        setIsLoadingCodes(true);
        setError(null);
        try {
            const token = await getIdToken(user);
            const userId = user.uid;
            const response = await CodesService.getCodesByUser(token, userId);
            setCodes(response.body);
        } catch (err) {
            console.error("Error cargando códigos", err);
            setError("No se pudieron cargar los códigos");
        } finally {
            setIsLoadingCodes(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCodes();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleDelete = async (codeId: string) => {
        if (!user) return;

        try {
            const token = await getIdToken(user);
            await CodesService.deleteCode(token, codeId);
            setCodes((prev) => prev.filter((c) => c.id !== codeId));
        } catch (err) {
            console.error("Error eliminando código", err);
        }
    };

    const handleToggleStatus = async (code: Code) => {
        if (!user) return;

        try {
            const token = await getIdToken(user);
            const newStatus = code.status === 'active' ? 'inactive' : 'active';
            await CodesService.updateCode(token, code.id, { status: newStatus });
            setCodes((prev) =>
                prev.map((c) =>
                    c.id === code.id ? { ...c, status: newStatus } : c
                )
            );
        } catch (err) {
            console.error("Error actualizando estado del código", err);
            alert("No se pudo actualizar el estado del código");
        }
    };

    const hasReferralCode = codes.some((code) => code.type === "referral");

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-primary-red" size={70} />
            </div>
        );
    }

    return (
        <div className="mt-8 lg:mt-[130px] min-h-screen bg-white py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-xl font-bold text-neutral-800 mb-6 uppercase">
                    Gestión de Códigos
                </h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {isLoadingCodes ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-primary-red" size={40} />
                    </div>
                ) : codes.length === 0 ? (
                    <div className="py-10 text-center text-neutral-500">
                        <p className="mb-4">Aún no tienes códigos creados.</p>
                    </div>
                ) : (
                    <div className="mb-6 bg-white rounded-lg border border-gray-200 px-4">
                        {codes.map((code) => (
                            <CodeCard
                                key={code.id}
                                code={code}
                                onDelete={handleDelete}
                                onToggleStatus={handleToggleStatus}
                            />
                        ))}
                    </div>
                )}

                <button
                    onClick={() => setIsUserModalOpen(true)}
                    disabled={hasReferralCode}
                    className={`w-full py-4 mb-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-opacity ${
                        hasReferralCode
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#e73533] to-[#ff6b6b] text-white hover:opacity-90"
                    }`}
                >
                    <Gift className="w-5 h-5" />
                    {hasReferralCode ? "YA TIENES UN CÓDIGO DE REFERIDO" : "CREAR MI CÓDIGO DE REFERIDO"}
                </button>
            </div>

            <UserCodeModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onSuccess={fetchCodes}
            />
        </div>
    );
}
