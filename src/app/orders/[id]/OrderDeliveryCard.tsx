"use client";

import { DeliveryAddress } from "@/types/orders";
import { Card, CardContent } from "@/components/ui/card";
import { OrderAddressRow } from "@/components/ui/OrderAddressRow";
import { formatCOP } from "@/components/ui/OrderItemsList";
import { toDeliveryLocation } from "./utils";

interface OrderDeliveryCardProps {
    address: DeliveryAddress;
}

export function OrderDeliveryCard({ address }: OrderDeliveryCardProps) {
    return (
        <div className="flex flex-col gap-2">
            <p className="body-font font-bold">Dirección de envío:</p>
            <Card className="p-4 w-full bg-accent-yellow-10 rounded-[12px] shadow-none border-0">
                <CardContent className="p-0 flex items-start justify-between gap-4">
                    <OrderAddressRow location={toDeliveryLocation(address)} className="flex-1" />
                    <h4 className="shrink-0">{formatCOP(address.deliveryPrice)}</h4>
                </CardContent>
            </Card>
        </div>
    );
}
