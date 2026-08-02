"use client";

import { OrderItem } from "@/types/orders";
import { OrderItemsList } from "@/components/ui/OrderItemsList";
import { SectionCard, SectionLabel } from "./Section";

interface OrderProductsSectionProps {
    items: OrderItem[];
}

export function OrderProductsSection({ items }: OrderProductsSectionProps) {
    return (
        <SectionCard className="px-5">
            <div className="py-4 border-b border-gray-100">
                <SectionLabel>Productos</SectionLabel>
            </div>
            <OrderItemsList items={items} className="py-4" />
        </SectionCard>
    );
}
