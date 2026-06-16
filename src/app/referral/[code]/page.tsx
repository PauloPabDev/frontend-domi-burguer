"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CodesService } from "@/services/codesService";
import { Code } from "@/types/codes";
import { Loader2, Gift, ArrowRight, QrCode, Users } from "lucide-react";
import { track } from "@/utils/analytics";
import Image from "next/image";
import { QRShare } from "@/components/QRShare";
import { SpikesIcon } from "@/components/ui/icons";

export default function ReferralPage() {
    const params = useParams();
    const router = useRouter();
    const codeParam = params.code as string;

    const [code, setCode] = useState<Code | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUrl, setCurrentUrl] = useState("");

    useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);

    useEffect(() => {
        const fetchCode = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await CodesService.getCodeByIdPublic(codeParam);
                setCode(response.body);

                const fetchedCode = response.body;
                const isCodeExpired = fetchedCode.expirationDate && new Date(fetchedCode.expirationDate) < new Date();
                const isCodeInactive = fetchedCode.status !== "active";

                if (!isCodeExpired && !isCodeInactive) {
                    localStorage.setItem("pendingReferralCode", fetchedCode.code);
                }
                track('referral_page_visited', {
                    referral_code: fetchedCode.code,
                    is_valid: !isCodeExpired && !isCodeInactive,
                });
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Código no encontrado";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (codeParam) {
            fetchCode();
        }
    }, [codeParam]);

    const handleGoToMenu = () => {
        track('referral_go_to_menu_clicked', { referral_code: code?.code || codeParam });
        router.push("/");
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin h-10 w-10 mx-auto mb-4 text-primary-red" />
                    <p className="text-neutral-black-60">Cargando código de referido...</p>
                </div>
            </div>
        );
    }

    if (error || !code) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <SpikesIcon className="w-full" />
                    <div className="bg-accent-yellow-10 px-6 py-8 text-center flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-primary-red-20 rounded-full flex items-center justify-center">
                            <Gift className="w-8 h-8 text-primary-red" />
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-black-80">Código no encontrado</h1>
                        <p className="text-neutral-black-60">
                            {error || "El código de referido que buscas no existe o ha expirado."}
                        </p>
                        <Button variant="primary" size="lg" fullWidth onClick={handleGoToMenu}>
                            Ir al menú
                        </Button>
                    </div>
                    <SpikesIcon className="w-full rotate-180" />
                </div>
            </div>
        );
    }

    const isExpired = code.expirationDate && new Date(code.expirationDate) < new Date();
    const isInactive = code.status !== "active";

    const steps = [
        {
            label: "Comparte tu código con alguien que nunca haya entrado con su correo o iniciado sesión en domiburguer.com",
        },
        {
            label: "La persona se registra con su correo y verifica su número de teléfono.",
        },
        {
            label: "Elige lo que desea del menú e ingresa la dirección.",
        },
        {
            label: 'En la parte inferior encuentra "Código de referido" e inserta el código que creaste.',
        },
        {
            label: "¡Y listo! Papas GRATIS para tu referido y 65 Domi puntos más cerca de reclamar tu combo.",
            highlight: true,
            number: false
        },
    ];

    return (
        <div className="min-h-[80vh] py-8 px-4">
            <div className="max-w-lg mx-auto flex flex-col gap-6">

                {/* Encabezado + Tarjeta del código */}
                <div className="w-full">
                    <SpikesIcon className="w-full" />
                    <div className="bg-accent-yellow-10 px-6 py-8 flex flex-col items-center gap-5">

                        <div className="text-center flex flex-col gap-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-neutral-black-80">
                                ¡Te han invitado a Domi Burguer!
                            </h1>
                            <p className="text-neutral-black-60 text-sm">
                                Usa este código en tu primer pedido
                            </p>
                        </div>

                        {/* Separador */}
                        <div className="w-full border-t border-accent-yellow-40" />

                        {/* Código */}
                        <div className="bg-white border-2 rounded-2xl px-8 py-4 shadow-sm w-full text-center">
                            <p className="text-3xl md:text-4xl font-bold text-neutral-black-80 tracking-widest">
                                {code.code}
                            </p>
                        </div>

                        {/* Badge papas gratis */}
                        <div className="inline-flex items-center gap-2 bg-accent-yellow-40 rounded-full px-4 py-2">
                            <span className="text-xl">🍟</span>
                            <span className="text-neutral-black-80 font-bold text-sm">¡Papas gratis con tu primer pedido!</span>
                        </div>

                        {(isExpired || isInactive) && (
                            <div className="bg-accent-yellow-40 border border-accent-yellow-60 rounded-full px-4 py-2 text-center">
                                <p className="text-neutral-black-80 text-sm font-medium">
                                    {isExpired ? "Este código ha expirado" : "Este código no está activo actualmente"}
                                </p>
                            </div>
                        )}

                        <Button
                            onClick={handleGoToMenu}
                            variant="primary"
                            size="lg"
                            fullWidth
                            rightIcon={<ArrowRight className="w-5 h-5" />}
                            disabled={!!(isExpired || isInactive)}
                        >
                            Ver el menú
                        </Button>

                        {code.description && (
                            <p className="text-center text-neutral-black-60 text-sm">{code.description}</p>
                        )}
                    </div>
                    <SpikesIcon className="w-full rotate-180" />
                </div>

                {/* Instrucciones para referidos */}
                <div className="w-full">
                    <SpikesIcon className="w-full" />
                    <div className="bg-accent-yellow-10 px-6 py-6 flex flex-col gap-4">
                        <h2 className="font-bold text-lg text-neutral-black-80 flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary-red" />
                            ¿Cómo usan el código tus referidos?
                        </h2>
                        <ol className="flex flex-col gap-4">
                            {steps.map((step, index) => (
                                <li key={index} className="flex gap-3">

                                    {step.number !== false && (
                                        <span className="flex-shrink-0 w-7 h-7 bg-primary-red text-white rounded-full flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </span>
                                    )}
                                    <p className={`text-sm leading-relaxed ${step.highlight ? "font-bold text-neutral-black-80" : "text-neutral-black-60"}`}>
                                        {step.label}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>
                    <SpikesIcon className="w-full rotate-180" />
                </div>

                {/* QR para compartir */}
                <div className="w-full">
                    <SpikesIcon className="w-full" />
                    <div className="bg-accent-yellow-10 px-6 py-6 flex flex-col gap-4">
                        <h2 className="font-bold text-lg text-neutral-black-80 flex items-center justify-center gap-2">
                            <QrCode className="w-5 h-5 text-primary-red" />
                            Comparte con QR
                        </h2>
                        {currentUrl && (
                            <QRShare
                                url={currentUrl}
                                title="Escanea para usar el código de referido"
                                fileName={`referido-${code.code}`}
                            />
                        )}
                    </div>
                    <SpikesIcon className="w-full rotate-180" />
                </div>

                {/* CTA */}
                <Button
                    onClick={handleGoToMenu}
                    variant="primary"
                    size="lg"
                    fullWidth
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    disabled={!!(isExpired || isInactive)}
                >
                    Ver el menú
                </Button>

                <p className="text-center text-neutral-black-50 text-sm">
                    ¿Tienes preguntas? Contáctanos por WhatsApp
                </p>
            </div>
        </div>
    );
}
