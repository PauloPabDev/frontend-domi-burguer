"use client";

import { use, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrderDetail } from "@/hooks/useOrderDetail";
import { OrderComment } from "@/components/ui/OrderComment";
import { OrderDetailHeader } from "./OrderDetailHeader";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { OrderProductsSection } from "./OrderProductsSection";
import { OrderDeliverySection } from "./OrderDeliverySection";
import { OrderPaymentSummary } from "./OrderPaymentSummary";
import { OrderPaymentMethodSection } from "./OrderPaymentMethodSection";

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
                    <Loader2 className="animate-spin h-8 w-8 mx-auto mb-3 text-[#e73533]" />
                    <p className="text-neutral-500 text-sm">Cargando detalles del pedido...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center mt-[130px] px-4">
                <div className="w-full max-w-md text-center">
                    <p className="text-red-600 font-semibold mb-2">Error</p>
                    <p className="text-neutral-500 text-sm mb-6">{error ?? "Pedido no encontrado"}</p>
                    <button
                        onClick={() => router.push("/orders")}
                        className="px-6 py-2 rounded-full bg-[#e73533] text-white text-sm font-bold"
                    >
                        Volver a Mis Pedidos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white mt-[130px]">
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                <OrderDetailHeader onBack={() => router.back()} />
                <OrderSummaryCard order={order} />
                <OrderProductsSection items={order.orderItems} />
                {order.deliveryAddress && <OrderDeliverySection address={order.deliveryAddress} />}
                <OrderPaymentSummary order={order} />
                <OrderPaymentMethodSection paymentMethod={order.paymentMethod} />
                {order.comment && <OrderComment comment={order.comment} />}
                <div className="pb-8" />
            </div>
        </div>
    );
}
