import { useEffect } from "react";
import { BancolombiaIcon, MoneyIcon, NequiIcon } from "@/components/ui/icons";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutFormStore } from "@/store/checkoutFormStore";
import { useAppliedCodeStore } from "@/store/appliedCodeStore";
import { useOrderSubmit } from "@/hooks/cart/useOrderSubmit";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentMethod } from "@/types/paymentMethod";
import { OrderPayload } from "@/types/OrderPayload";
import { Address } from "@/types/address";
import { useRouter } from "next/navigation";
import { track } from "@/utils/analytics";


function useFormCart() {
  const { items, address, getSubtotal, getTotal } = useCartStore();
  const { formData, setFormData, setFormField, error, setError, isSubmitting, setIsSubmitting } = useCheckoutFormStore();
  const { resetForm } = useCheckoutFormStore();
  const { clearCart } = useCartStore();
  const { clearAll: clearAppliedCode } = useAppliedCodeStore();
  const router = useRouter();
  const { submitOrder } = useOrderSubmit(
    (result) => {
      // Guardar última orden en localStorage ANTES de limpiar
      const lastOrder = {
        name: formData.name,
        phone: formData.phone,
        comment: formData.comment,
        address: address,
        orderItems: items,
        paymentMethod: formData.paymentMethod,
        prices: {
          subtotal: getSubtotal(),
          total: getTotal(),
        },
      };
      localStorage.setItem("lastOrder", JSON.stringify(lastOrder));

      // Limpiar carrito, formulario y código aplicado
      clearCart();
      resetForm();
      clearAppliedCode();

      // Redirigir a la página de confirmación
      track('order_success', {
        order_id: result.id,
        total: getTotal(),
        subtotal: getSubtotal(),
        payment_method: formData.paymentMethod,
        item_count: items.length,
      });
      router.push("/thankyou");
    },
    (apiError) => {
      console.error("Error submitting order:", apiError);
      track('order_failed', {
        error: apiError.message || 'unknown',
        item_count: items.length,
        payment_method: formData.paymentMethod,
      });
      setError(apiError.message || "Error al procesar la orden");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  );
  const { user } = useAuth();

  const paymentMethods: PaymentMethod[] = [
    {
      id: "cash",
      label: "Efectivo",
      iconClass: "w-[38px] h-[32px]",
      icon: MoneyIcon,
      selected: true,
    },
    {
      id: "bancolombia",
      label: "Bancolombia",
      iconClass: "w-[28px] h-[28px]",
      icon: BancolombiaIcon,
      selected: false,
    },
    {
      id: "nequi",
      label: "Nequi",
      iconClass: "w-[36px] h-[25px]",
      icon: NequiIcon,
      selected: false,
    },
  ];

  // Actualizar el formulario con los datos del usuario cuando se autentica
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.displayName || "",
        phone: user.phoneNumber || ""
      });
    }
  }, [user, setFormData]);

  useEffect(() => {
    if (address && error === "Debes agregar una dirección de entrega") {
      setError(null);
    }
  }, [address, error, setError]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormField(name as keyof typeof formData, value);
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormField("phone", value || "");
  };

  // Validación de campos
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("El nombre es requerido");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    if (!formData.phone.trim()) {
      setError("El teléfono es requerido");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    if (items.length === 0) {
      setError("El carrito está vacío");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    if (!address || !address.coordinates) {
      setError("Debes agregar una dirección de entrega");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    setError(null);
    return true;
  };


  interface BuildOrderPayloadParams {
    formData: typeof formData;
    address: Address;
    items: typeof items;
  }
  const buildOrderPayload = ({ formData, address, items }: BuildOrderPayloadParams): OrderPayload => {
    const orderPayload: OrderPayload = {
      name: formData.name,
      phone: formData.phone,
      comment: formData.comment,
      locationId: address?.id,
      delivery: {
        price: address?.deliveryPrice || 0,
        distance: address?.distance || 0,
      },
      orderItems: items.map((item) => ({
        id: item.productId.toString(),
        quantity: item.quantity,
        // Si el item es un premio gratis, incluir el código a nivel de item
        ...(item.rewardCode ? { codes: [item.rewardCode] } : {}),
        complements: item.complements.map((comp) => ({
          id: comp.id.toString(),
          quantity: comp.quantity,
          ...(comp?.rewardCode ? { codes: [comp.rewardCode] as [string] } : {}),
        })),
      })),
      paymentMethod: formData.paymentMethod,
    };
    if (user) {
      orderPayload.userId = user.uid;
    }
    return orderPayload;
  };

  // Maneja el envío de la orden
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    if (!address) {
      setError("Debes agregar una dirección de entrega");
      return;
    }

    track('checkout_submitted', {
      item_count: items.length,
      payment_method: formData.paymentMethod,
      has_address: true,
      is_authenticated: !!user,
    });

    const orderPayload = buildOrderPayload({ formData, address, items });

    const token = await user?.getIdToken();

    setIsSubmitting(true);
    try {
      await submitOrder({ orderPayload, token });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    handlePhoneChange,
    paymentMethods,
    isSubmitting,
    error,
    validateForm,
  };
}

export default useFormCart;
