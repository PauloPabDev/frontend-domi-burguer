"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneNumberInput } from "@/components/ui/inputPhone";
import { useAuth } from "@/contexts/AuthContext";
import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  linkWithCredential,
  unlink,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Modal } from "@/components/ui/modal";
import { track } from "@/utils/analytics";
import { ConfirmModal } from "@/components/ui/modal/presets/ConfirmModal";
import { modalErrorVariants } from "@/components/ui/modal/variants";
import { cn } from "@/lib/utils";
import { getAuthErrorMessage } from "@/utils/authErrors";

interface PhoneVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "link" | "change";
  onSuccess?: (phoneNumber: string) => void;
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  open,
  onOpenChange,
  mode = "link",
  onSuccess,
}) => {
  const { user, error, clearError } = useAuth();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  const [errorMsg, setErrorMsg] = useState<{ message: string; hint?: string } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);

  const [verificationId, setVerificationId] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const otpAbortRef = useRef<AbortController | null>(null);

  const recaptchaContainerId = "phone-modal-recaptcha";
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Claves para sessionStorage
  const STORAGE_KEY_VERIFICATION_ID = "phone_verification_id";
  const STORAGE_KEY_PHONE = "phone_verification_phone";
  const STORAGE_KEY_TIMESTAMP = "phone_verification_timestamp";
  const CODE_VALIDITY_SECONDS = 5 * 60; // 5 minutos

  // Función para guardar estado en sessionStorage
  const saveVerificationState = (vid: string, phoneNumber: string) => {
    sessionStorage.setItem(STORAGE_KEY_VERIFICATION_ID, vid);
    sessionStorage.setItem(STORAGE_KEY_PHONE, phoneNumber);
    sessionStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());
  };

  // Función para limpiar estado de sessionStorage
  const clearVerificationState = () => {
    sessionStorage.removeItem(STORAGE_KEY_VERIFICATION_ID);
    sessionStorage.removeItem(STORAGE_KEY_PHONE);
    sessionStorage.removeItem(STORAGE_KEY_TIMESTAMP);
  };

  // Función para obtener el tiempo restante desde sessionStorage
  const getRemainingTime = (): number => {
    const timestamp = sessionStorage.getItem(STORAGE_KEY_TIMESTAMP);
    if (!timestamp) return 0;

    const elapsed = Math.floor((Date.now() - parseInt(timestamp)) / 1000);
    const remaining = CODE_VALIDITY_SECONDS - elapsed;
    return remaining > 0 ? remaining : 0;
  };

  const clearRecaptcha = () => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch {
        // ignore
      }
      recaptchaVerifierRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  useEffect(() => {
    if (open) {
      track('phone_verification_opened', { mode });
      // Intentar restaurar estado previo de verificación
      const savedVerificationId = sessionStorage.getItem(STORAGE_KEY_VERIFICATION_ID);
      const savedPhone = sessionStorage.getItem(STORAGE_KEY_PHONE);
      const remainingTime = getRemainingTime();

      if (savedVerificationId && savedPhone && remainingTime > 0) {
        // Restaurar al paso de código si hay una verificación pendiente válida
        setVerificationId(savedVerificationId);
        setPhone(savedPhone);
        setStep("code");
        setTimeLeft(remainingTime);
        setCode("");
        setErrorMsg(null);
        setSuccessMsg("Código enviado anteriormente. Ingresa el código para verificar.");
      } else {
        // Limpiar estado expirado y empezar de nuevo
        clearVerificationState();
        setPhone("");
        setCode("");
        setStep("phone");
        setErrorMsg(null);
        setSuccessMsg(null);
        setVerificationId(null);
      }
      clearError();
    } else {
      clearRecaptcha();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [open, clearError]);

  useEffect(() => {
    if (step === "code") {
      setTimeLeft(15 * 60);

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
            // El usuario rechazó o el SMS no llegó a tiempo — flujo manual normal
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

  const formatMMSS = (total: number) => {
    const m = Math.floor(total / 60)
      .toString()
      .padStart(2, "0");
    const s = (total % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const normalizePhone = (phoneValue: string): string => {
    // PhoneNumberInput ya devuelve el número con código de país (ej: +57, +1, +34)
    return phoneValue;
  };

  const getOrCreateRecaptcha = (): RecaptchaVerifier => {
    clearRecaptcha();

    const container = document.getElementById(recaptchaContainerId);
    if (container) {
      container.innerHTML = "";
    }

    recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: "invisible",
    });

    return recaptchaVerifierRef.current;
  };

  const handleSendCode = async () => {
    if (!user) {
      setErrorMsg({
        message: "Debes iniciar sesión para verificar tu teléfono.",
        hint: "Inicia sesión y vuelve a intentarlo.",
      });
      return;
    }

    const normalized = normalizePhone(phone);
    // Validación básica: debe tener al menos código de país (+X) y algunos dígitos
    if (!normalized || normalized.length < 8) {
      setErrorMsg({
        message: "Ingresa un número de teléfono válido.",
        hint: "Revisa que hayas escrito el número completo, sin espacios ni letras, incluyendo el indicativo del país (ej: +57 300 123 4567).",
      });
      return;
    }

    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      setSending(true);

      const recaptchaVerifier = getOrCreateRecaptcha();
      const provider = new PhoneAuthProvider(auth);

      const vid = await provider.verifyPhoneNumber(normalized, recaptchaVerifier);

      setVerificationId(vid);
      saveVerificationState(vid, normalized);
      setStep("code");
      setSuccessMsg("Código enviado por SMS. Escríbelo abajo para confirmar.");
    } catch (e: unknown) {
      const { message, hint } = getAuthErrorMessage(e);
      setErrorMsg({ message, hint });
    } finally {
      setSending(false);
    }
  };

  const handleVerifyAndLink = async () => {
    if (!user) {
      setErrorMsg({
        message: "Debes iniciar sesión para verificar tu teléfono.",
        hint: "Inicia sesión y vuelve a intentarlo.",
      });
      return;
    }

    if (!verificationId) {
      setErrorMsg({
        message: "Primero envía el código SMS.",
        hint: "Presiona \"Enviar código\" antes de escribir el código de verificación.",
      });
      return;
    }

    if (!code || code.length < 6) {
      setErrorMsg({
        message: "El código debe tener 6 dígitos.",
        hint: "Revisa el SMS que recibiste y escribe los 6 dígitos del código.",
      });
      return;
    }

    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      setVerifying(true);

      if (mode === "change" && user.phoneNumber) {
        try {
          await unlink(user, "phone");
        } catch {
          console.warn("No se pudo desvincular el teléfono anterior");
        }
      }

      const credential = PhoneAuthProvider.credential(verificationId, code);
      await linkWithCredential(user, credential);

      await user.reload();

      // Limpiar estado de verificación al completar exitosamente
      clearVerificationState();

      setSuccessMsg("Teléfono verificado y vinculado exitosamente.");

      // Esperar un momento para mostrar el mensaje de éxito y luego cerrar el modal
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(normalizePhone(phone));
        }
        onOpenChange(false);
      }, 1500);
    } catch (e: unknown) {
      const { message, hint } = getAuthErrorMessage(e);
      setErrorMsg({ message, hint });
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = () => {
    clearVerificationState();
    setCode("");
    setStep("phone");
    setVerificationId(null);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleUnlinkPhone = async () => {
    if (!user || !user.phoneNumber) return;

    try {
      setUnlinking(true);
      setErrorMsg(null);

      await unlink(user, "phone");
      await user.reload();

      setShowUnlinkConfirm(false);
      setSuccessMsg("Teléfono desvinculado. Ahora puedes agregar uno nuevo.");
    } catch (e: unknown) {
      const { message, hint } = getAuthErrorMessage(e);
      setErrorMsg({ message, hint });
    } finally {
      setUnlinking(false);
    }
  };

  const title =
    mode === "change" ? "Cambiar número de teléfono" : "Verificar teléfono";
  const description =
    mode === "change"
      ? "Ingresa tu nuevo número de teléfono para vincularlo a tu cuenta."
      : "Inicia sesión o regístrate con tu número de celular.";

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="md"
      footer={false}
      variant="form"
    >
      <div className="flex flex-col w-full gap-5">
        {/* Mensajes de error/éxito */}
        {(errorMsg || error) && (
          <div className={cn(modalErrorVariants({ type: "error" }), "text-left")}>
            <p className="font-medium">{errorMsg?.message || error?.message}</p>
            {(errorMsg?.hint || error?.hint) && (
              <p className="mt-1 text-xs opacity-80">
                {errorMsg?.hint || error?.hint}
              </p>
            )}
          </div>
        )}

        {successMsg && (
          <div className={cn(modalErrorVariants({ type: "success" }))}>
            {successMsg}
          </div>
        )}

        {/* Modal de confirmación para desvincular */}
        <ConfirmModal
          open={showUnlinkConfirm}
          onOpenChange={setShowUnlinkConfirm}
          title="Desvincular teléfono"
          message={`¿Estás seguro de que deseas desvincular el número ${user?.phoneNumber}? Tendrás que verificar un nuevo número.`}
          onConfirm={handleUnlinkPhone}
          confirmText="DESVINCULAR"
          cancelText="CANCELAR"
          destructive
          loading={unlinking}
        />

        {/* Teléfono actual (solo en modo cambio) */}
        {mode === "change" && user?.phoneNumber && (
          <div className="p-4 border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide">Teléfono actual</p>
                <p className="font-semibold text-neutral-800 mt-1">{user.phoneNumber}</p>
              </div>
            </div>
            <button
              onClick={() => setShowUnlinkConfirm(true)}
              disabled={unlinking}
              className="mt-3 w-full py-2 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {unlinking ? "Desvinculando..." : "Desvincular teléfono"}
            </button>
          </div>
        )}

        {/* Step 1: Ingresar teléfono */}
        {step === "phone" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wide mb-2 block">
                Número de teléfono
              </label>
              <PhoneNumberInput
                value={phone}
                onChange={(value: string | undefined) => setPhone(value || "")}
                placeholder="Ej: 300 123 4567"
                className="w-full"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter" && !sending && phone && phone.length >= 8) {
                    e.preventDefault();
                    handleSendCode();
                  }
                }}
              />
            </div>

            <Button
              onClick={handleSendCode}
              disabled={sending || !phone || phone.length < 8}
              className="text-white rounded-xl w-full h-12 text-base font-medium"
            >
              {sending ? "Enviando..." : "ENVIAR CÓDIGO"}
            </Button>
          </div>
        )}

        {/* Step 2: Verificar código */}
        {step === "code" && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <p className="text-sm text-neutral-600">
                Enviamos un código a <span className="font-semibold">{phone}</span>
              </p>
            </div>

            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wide mb-2 block">
                Código de verificación
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !verifying && code.length >= 6 && timeLeft > 0) {
                    e.preventDefault();
                    handleVerifyAndLink();
                  }
                }}
                maxLength={6}
                className="w-full h-14 text-center text-2xl tracking-[0.4em] font-semibold rounded-xl border-gray-300 focus:border-primary-red"
                placeholder="000000"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>

            <div className="flex justify-center">
              <span className={`text-sm ${timeLeft < 60 ? 'text-red-500' : 'text-neutral-500'}`}>
                Código válido por <span className="font-bold">{formatMMSS(timeLeft)}</span>
              </span>
            </div>

            <Button
              onClick={handleVerifyAndLink}
              disabled={verifying || code.length < 6 || timeLeft === 0}
              className="text-white rounded-xl w-full h-12 text-base font-medium"
            >
              {verifying ? "Verificando..." : "VERIFICAR"}
            </Button>

            <button
              type="button"
              onClick={handleResend}
              disabled={sending}
              className="text-sm text-neutral-500 hover:text-neutral-700 self-center w-full text-center py-2"
            >
              ¿No recibiste el código? <span className="underline">Reenviar</span>
            </button>
          </div>
        )}

        <div id={recaptchaContainerId} />
      </div>
    </Modal>
  );
};

export default PhoneVerificationModal;
