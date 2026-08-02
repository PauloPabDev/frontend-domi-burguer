"use client";

import { Order } from "@/types/orders";
import { formatCOP } from "@/components/ui/OrderItemsList";
import { SectionCard, SectionLabel } from "./Section";

interface OrderPaymentSummaryProps {
    order: Pick<Order, "subtotal" | "deliveryPrice" | "totalPrice">;
}

export function OrderPaymentSummary({ order }: OrderPaymentSummaryProps) {
    return (
        <SectionCard className="p-5">
            <SectionLabel className="mb-4">Resumen del Pago</SectionLabel>
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-neutral-600">
                    <span>Subtotal</span>
                    <span>{formatCOP(order.subtotal ?? 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                    <span>Envío</span>
                    <span>{formatCOP(order.deliveryPrice ?? 0)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-neutral-800">
                    <span>Total</span>
                    <span>{formatCOP(order.totalPrice ?? 0)}</span>
                </div>
            </div>
        </SectionCard>
    );
}
