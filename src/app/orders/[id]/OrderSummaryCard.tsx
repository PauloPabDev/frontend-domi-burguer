"use client";

import { Order } from "@/types/orders";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { formatFullDateTime } from "@/lib/dates";
import { SectionCard } from "./Section";

interface OrderSummaryCardProps {
    order: Order;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
    return (
        <SectionCard className="p-5">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs text-neutral-400 uppercase font-bold tracking-wide">
                        Pedido N°
                    </p>
                    <p className="text-xl font-bold text-neutral-800">{order.orderNumber}</p>
                    <p className="text-xs text-neutral-400 mt-1">{formatFullDateTime(order.createdAt)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>
        </SectionCard>
    );
}
