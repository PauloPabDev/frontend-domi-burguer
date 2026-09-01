"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { ConfirmationResult } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { track } from "@/utils/analytics";

interface PhoneLoginProps {
    onClose: () => void;
    onSuccess?: (phoneNumber: string) => void;
    redirectTo?: string;
}

/**
 * Componente de inicio de sesión con teléfono
 */
export const PhoneLogin = ({ onClose, onSuccess, redirectTo = "/profile" }: PhoneLoginProps) => {
    const router = useRouter();
    const { phoneSignIn, error, clearError } = useAuth();

    // Estado del formulario
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState<"phone" | "code">("phone");

    // Estado de procesamiento
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);

    // Errores de validación local (no vienen de Firebase, ej: número/código incompletos)
    const [localError, setLocalError] = useState<{ message: string; hint?: string } | null>(null);

    // Temporizador
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Mantener la referencia al resultado de confirmación
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const otpAbortRef = useRef<AbortController | null>(null);

    // Efecto para el temporizador y WebOTP
    useEffect(() => {
        if (step === "code") {
            setTimeLeft(15 * 60); // 15 minutos en segundos
            if (timerRef.current) clearInterval(timerRef.current);

            timerRef.current = setInterval(() => {
                setTimeLeft((s) => {
                    if (s <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        return 0;
                    }
                    return s - 1;
                });
            }, 1000);

            // WebOTP: autocompletar código desde SMS
            if ("OTPCredential" in window) {
                const ac = new AbortController();
                otpAbortRef.current = ac;

                navigator.credentials
                    .get({ otp: { transport: ["sms"] }, signal: ac.signal } as CredentialRequestOptions)
                    .then((credential) => {
                        if (credential && "code" in credential) {
                            setCode((credential as OTPCredential).code);
                        }
                    })
                    .catch(() => {
                        // El usuario rechazó o el SMS no llegó — flujo manual normal
                    });
            }
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (otpAbortRef.current) {
                otpAbortRef.current.abort();
                otpAbortRef.current = null;
            }
        };
    }, [step]);

    // Formatear tiempo como MM:SS
    const formatMMSS = (total: number) => {
        const m = Math.floor(total / 60).toString().padStart(2, "0");
        const s = (total % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // Normalizar número de teléfono
    const normalizePhone = (phone: string): string => {
        const cleaned = phone.replace(/\D/g, "");
        return "+57" + cleaned;
    };

    // Enviar código de verificación
    const handleSendCode = async () => {
        const normalized = normalizePhone(phone);
        if (normalized.length < 12) {
            setLocalError({
                message: "Ingresa un número de teléfono válido.",
                hint: "Revisa que hayas escrito el número completo, sin espacios ni letras (ej: 300 123 4567).",
            });
            return;
        }

        try {
            clearError();
            setLocalError(null);
            setSending(true);

            const result = await phoneSignIn.sendVerificationCode(
                normalized,
                "recaptcha-container"
            );

            setConfirmationResult(result);
            setStep("code");
            track('phone_login_code_sent');
        } catch (error) {
            console.error("Error al enviar código:", error);
        } finally {
            setSending(false);
        }
    };

    // Verificar código
    const handleVerifyCode = async () => {
        if (!confirmationResult) return;

        if (code.length !== 6) {
            setLocalError({
                message: "El código debe tener 6 dígitos.",
                hint: "Revisa el SMS que recibiste y escribe los 6 dígitos del código.",
            });
            return;
        }

        try {
            clearError();
            setLocalError(null);
            setVerifying(true);

            await phoneSignIn.verifyCode(confirmationResult, code);

            // Si hay un callback de éxito, llamarlo
            if (onSuccess) onSuccess(normalizePhone(phone));

            // Cerrar el modal y redirigir
            track('phone_login_verified');
            onClose();
            if (redirectTo) router.push(redirectTo);
        } catch (error) {
            console.error("Error al verificar código:", error);
        } finally {
            setVerifying(false);
        }
    };

    // Reenviar código
    const handleResend = async () => {
        setCode("");
        setStep("phone");
        await handleSendCode();
    };

    return (
        <div className="flex flex-col w-full gap-4">
            {/* Mensaje de error */}
            {(localError || error) && (
                <div className="text-red-600 text-sm">
                    <p className="font-medium">{localError?.message || error?.message}</p>
                    {(localError?.hint || error?.hint) && (
                        <p className="mt-1 text-xs text-red-500">
                            {localError?.hint || error?.hint}
                        </p>
                    )}
                </div>
            )}

            {/* Campo de teléfono */}
            <div
                className={`w-full pl-6 pr-0 py-0 flex h-12 items-center justify-center relative rounded-[30px] border-[1.5px] border-solid border-[#cccccc] ${step === "code" ? "opacity-60 pointer-events-none" : ""
                    }`}
            >
                <div className="text-sm relative w-fit font-bold text-neutrosblack-80 tracking-[0] leading-[18px] whitespace-nowrap">
                    +57
                </div>
                <div className="bg-[#cccccc] ml-6 w-[1px] h-full rotate-180" />
                <Input
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="322  55  67  23"
                    className="border-none shadow-none w-full"
                    disabled={step === "code"}
                />
            </div>

            {/* Campo de código */}
            <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                disabled={step !== "code"}
                className="gap-4 px-5 py-0 self-stretch w-full flex h-12 items-center justify-center relative rounded-[30px] border-[1.5px] border-solid border-[#cccccc] tracking-[0.8em] space-x-3 bg-transparent text-neutral-black-50! font-normal! leading-[18px] text-center text-[20px]!"
                placeholder="000000"
                inputMode="numeric"
                autoComplete="one-time-code"
                style={{ fontFamily: "Montserrat, Helvetica" }}
            />

            {/* Temporizador */}
            <div className="flex justify-between px-5">
                <p className="body-font">Código válido por</p>
                <span className="body-font font-bold">
                    {step === "code" ? formatMMSS(timeLeft) : "15:00"}
                </span>
            </div>

            {/* Botones de acción */}
            {step === "phone" && (
                <Button
                    onClick={handleSendCode}
                    disabled={sending || !phone || phone.length < 10}
                    className="text-white rounded-[30px] mb-2 flex items-center gap-2 text-[16px] w-full h-[48px]"
                >
                    {sending ? "Enviando..." : "ENVIAR CÓDIGO"}
                </Button>
            )}

            {step === "code" && (
                <>
                    <Button
                        onClick={handleVerifyCode}
                        disabled={verifying || code.length < 6}
                        className="text-white rounded-[30px] mb-2 flex items-center gap-2 text-[16px] w-full h-[48px]"
                    >
                        {verifying ? "Verificando..." : "VERIFICAR"}
                    </Button>

                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={sending || timeLeft > 14 * 60} // No permitir reenvío hasta después de 1 minuto
                        className="text-sm underline self-center text-neutral-600"
                    >
                        ¿No recibiste el código? Reenviar
                    </button>
                </>
            )}

            {/* Contenedor para el recaptcha (hidden) */}
            <div id="recaptcha-container" className="hidden" />
        </div>
    );
};
