"use client";

import { OrderStatus } from "@/types/orders";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_PRESENTATION } from "./utils";

interface OrderStatusBannerProps {
    status: OrderStatus;
}

export function OrderStatusBanner({ status }: OrderStatusBannerProps) {
    const presentation = ORDER_STATUS_PRESENTATION[status];

    return (
        <div
            className={cn(
                "flex flex-col gap-1 px-4 py-3 rounded-[12px] border border-solid",
                presentation.bg,
                presentation.border,
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <span className="body-font text-neutral-black-80">Estado del pedido:</span>
                <span className={cn("body-font font-bold", presentation.text)}>{presentation.label}</span>
            </div>
            <p className="body-font text-neutral-black-50">{presentation.message}</p>
        </div>
    );
}
