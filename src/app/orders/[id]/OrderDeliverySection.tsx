"use client";

import { MapPin } from "lucide-react";
import { DeliveryAddress } from "@/types/orders";
import { OrderAddressRow } from "@/components/ui/OrderAddressRow";
import { SectionCard, SectionLabel } from "./Section";
import { toDeliveryLocation } from "./utils";

interface OrderDeliverySectionProps {
    address: DeliveryAddress;
}

export function OrderDeliverySection({ address }: OrderDeliverySectionProps) {
    return (
        <SectionCard className="p-5">
            <SectionLabel
                icon={<MapPin className="w-4 h-4 text-[#e73533]" />}
                className="mb-4"
            >
                Dirección de Entrega
            </SectionLabel>
            <OrderAddressRow location={toDeliveryLocation(address)} />
        </SectionCard>
    );
}
