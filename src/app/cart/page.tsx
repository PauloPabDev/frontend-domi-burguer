"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CheckoutFormProvider } from "@/contexts/CheckoutFormContext";

import { useCartSubmit } from "@/hooks/cart/useCartSubmit";

// Components
import { LoadingOverlay } from "@/components/cart/loadingOverlay";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { CartSummary } from "@/components/cart/CartSummary";
import { CartModals } from "@/components/cart/CartModals";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckoutFormStore } from "@/store/checkoutFormStore";

// Lazy load modal pesado
const PhoneVerificationModal = dynamic(
  () => import("@/components/phone/PhoneVerificationModal").then(mod => mod.PhoneVerificationModal),
  { ssr: false }
);

export default function Cart() {
  const { handleSubmitWithValidation, isSubmitting } = useCartSubmit();

  // Verificación de teléfono integrada
  const { user, reloadUser } = useAuth();
  const { setFormData } = useCheckoutFormStore();
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [hasCheckedPhone, setHasCheckedPhone] = useState(false);

  // Abrir modal si el usuario está autenticado pero no tiene teléfono verificado
  useEffect(() => {
    if (user && !hasCheckedPhone) {
      if (!user.phoneNumber) {
        setPhoneModalOpen(true);
      }
      setHasCheckedPhone(true);
    }
  }, [user, hasCheckedPhone]);

  // Callback cuando el teléfono se verifica exitosamente
  const handlePhoneVerified = async (phoneNumber: string) => {
    await reloadUser();
    // Actualizar el formData con el número verificado
    setFormData({ phone: phoneNumber });
    setPhoneModalOpen(false);
  };

  return (
    <CheckoutFormProvider>
      <form onSubmit={handleSubmitWithValidation}>
        <LoadingOverlay isLoading={isSubmitting} />

        <div className="flex flex-col xl:flex-row w-full xl:justify-around items-center xl:items-start gap-5 mt-[130px] lg:mt-[130px] mb-[100px]">
          {/* Formulario de checkout */}
          <CheckoutForm />

          {/* Resumen del pedido */}
          <CartSummary />

          {/* Todos los modales */}
          <CartModals />

          {/* Modal de verificación de teléfono */}
          <PhoneVerificationModal
            open={phoneModalOpen}
            onOpenChange={setPhoneModalOpen}
            mode="link"
            onSuccess={handlePhoneVerified}
          />
        </div>
      </form>
    </CheckoutFormProvider>
  );
}