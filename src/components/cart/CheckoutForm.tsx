import { FormHeader } from "./FormHeader";
import { UserInfoSection } from "./UserInfoSection";
import { AddressSection } from "./AddressSection";
import { PaymentMethodsSection } from "./PaymentMethodsSection";
import useFormCart from "@/hooks/cart/useFormcart";
import { useCheckoutFormStore } from "@/store/checkoutFormStore";

export function CheckoutForm() {

    const {
        formData,
        handleChange,
        paymentMethods,
        error,
    } = useFormCart();

    const { setError } = useCheckoutFormStore();

    const handleClearError = () => {
        setError(null);
    };

    return (
        <div className="flex flex-col gap-14 pb-6 w-full lg:mt-4 max-w-[500px]">
            <div className="flex flex-col gap-6 w-full">
                <FormHeader error={error} onClearError={handleClearError} />

                <UserInfoSection
                    formData={formData}
                    handleChange={handleChange}
                />

                <AddressSection />

                <PaymentMethodsSection
                    paymentMethods={paymentMethods}
                    selectedMethod={formData.paymentMethod}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
}