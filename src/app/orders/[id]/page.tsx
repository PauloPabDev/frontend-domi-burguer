"use client";

import { use, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrderDetail } from "@/hooks/useOrderDetail";
import { Button } from "@/components/ui/button";
import { OrderComment } from "@/components/ui/OrderComment";
import { OrderDetailHeader } from "./OrderDetailHeader";
import { OrderStatusBanner } from "./OrderStatusBanner";
import { OrderDeliveryCard } from "./OrderDeliveryCard";
import { OrderSummaryPanel } from "./OrderSummaryPanel";
import { OrderWhatsAppHelp } from "./OrderWhatsAppHelp";

interface OrderDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
    const { id } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { order, isLoading, error } = useOrderDetail(id);

    useEffect(() => {
        if (authLoading) return;
        if (!user) router.replace("/login");
    }, [authLoading, user, router]);

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center mt-[130px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-8 w-8 mx-auto mb-3 text-primary-red" />
                    <p className="body-font text-neutral-black-50">Cargando detalles del pedido...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center mt-[130px] px-4">
                <div className="w-full max-w-md text-center flex flex-col items-center gap-4">
                    <p className="text-primary-red font-bold">Error</p>
                    <p className="body-font text-neutral-black-50">{error ?? "Pedido no encontrado"}</p>
                    <Button variant="primary" onClick={() => router.push("/orders")}>
                        Volver a Mis Pedidos
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col xl:flex-row w-full xl:justify-around items-center xl:items-start gap-5 mt-[130px] mb-[100px] px-4">
            <div className="flex h-full w-full pb-10 max-w-[500px]">
                <div className="flex flex-col h-full gap-6 w-full mt-5">
                    <OrderDetailHeader
                        orderNumber={order.orderNumber}
                        createdAt={order.createdAt}
                        onBack={() => router.back()}
                    />

                    <OrderStatusBanner status={order.status} />

                    <div className="flex flex-col gap-4 w-full">
                        {order.deliveryAddress && <OrderDeliveryCard address={order.deliveryAddress} />}

                        {order.comment && (
                            <div className="flex flex-col gap-2">
                                <p className="body-font font-bold">Comentario:</p>
                                <OrderComment comment={order.comment} />
                            </div>
                        )}

                        <OrderWhatsAppHelp orderNumber={order.orderNumber} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-start gap-8 max-w-[500px] w-full">
                <OrderSummaryPanel order={order} />
            </div>
        </div>
    );
}
