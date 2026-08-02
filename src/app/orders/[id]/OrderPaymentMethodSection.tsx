"use client";

import { CreditCard } from "lucide-react";
import { PaymentMethod } from "@/types/orders";
import { PAYMENT_LABELS } from "@/types/worker";
import { SectionCard, SectionLabel } from "./Section";

interface OrderPaymentMethodSectionProps {
    paymentMethod: PaymentMethod;
}

export function OrderPaymentMethodSection({ paymentMethod }: OrderPaymentMethodSectionProps) {
    return (
        <SectionCard className="p-5">
            <SectionLabel
                icon={<CreditCard className="w-4 h-4 text-neutral-400" />}
                className="mb-3"
            >
                Método de Pago
            </SectionLabel>
            <p className="text-sm font-semibold text-neutral-800">
                {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
            </p>
        </SectionCard>
    );
}
