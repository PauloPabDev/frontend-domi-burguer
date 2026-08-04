"use client";

import { Order } from "@/types/orders";
import { OrderComment } from "@/components/ui/OrderComment";
import { OrderDetailHeader } from "../../orders/[id]/OrderDetailHeader";
import { OrderStatusBanner } from "../../orders/[id]/OrderStatusBanner";
import { OrderDeliveryCard } from "../../orders/[id]/OrderDeliveryCard";
import { OrderSummaryPanel } from "../../orders/[id]/OrderSummaryPanel";
import { OrderWhatsAppHelp } from "../../orders/[id]/OrderWhatsAppHelp";

const mockOrder: Order = {
    id: "abc123",
    orderNumber: "D-4821",
    status: "preparing",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalPrice: 62000,
    deliveryPrice: 6000,
    subtotal: 56000,
    orderItems: [
        {
            id: "i1",
            name: "Domi Clásica",
            price: 22000,
            quantity: 2,
            colorPrimary: "#e73533",
            complements: [
                { id: "c1", name: "Queso extra", price: 3000, quantity: 1, colorPrimary: "#f59e0b" },
            ],
        },
        {
            id: "i2",
            name: "Papas grandes",
            price: 9000,
            quantity: 1,
            colorPrimary: "#8b5cf6",
        },
    ],
    deliveryAddress: {
        name: "Casa",
        address: "Cra 45 #23-10, Apto 302",
        city: "Medellín",
        country: "Colombia",
        floor: "3",
        coordinates: { lat: 6.2442, lng: -75.5812 },
        deliveryPrice: 6000,
        comment: "Portería azul, timbre 302",
    },
    paymentMethod: "nequi",
    comment: "Sin cebolla por favor",
    dailyOrderNumber: 12,
};

export default function OrderPreviewPage() {
    return (
        <div className="flex flex-col xl:flex-row w-full xl:justify-around items-center xl:items-start gap-5 mt-[130px] mb-[100px] px-4">
            <div className="flex h-full w-full pb-10 max-w-[500px]">
                <div className="flex flex-col h-full gap-6 w-full mt-5">
                    <OrderDetailHeader
                        orderNumber={mockOrder.orderNumber}
                        createdAt={mockOrder.createdAt}
                        onBack={() => {}}
                    />

                    <OrderStatusBanner status={mockOrder.status} />

                    <div className="flex flex-col gap-4 w-full">
                        {mockOrder.deliveryAddress && <OrderDeliveryCard address={mockOrder.deliveryAddress} />}

                        {mockOrder.comment && (
                            <div className="flex flex-col gap-2">
                                <p className="body-font font-bold">Comentario:</p>
                                <OrderComment comment={mockOrder.comment} />
                            </div>
                        )}

                        <OrderWhatsAppHelp orderNumber={mockOrder.orderNumber} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-start gap-8 max-w-[500px] w-full">
                <OrderSummaryPanel order={mockOrder} />
            </div>
        </div>
    );
}
