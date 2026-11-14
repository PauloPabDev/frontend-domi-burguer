"use client";

import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Package } from "lucide-react";
import { OrderHistoryCard } from "@/components/orders/OrderHistoryCard";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
    const { orders, loading, error } = useOrders();
    const { user } = useAuth();
    const router = useRouter();

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center mt-[130px] px-4">
                <div className="w-full max-w-md text-center flex flex-col items-center gap-4">
                    <h1>Inicia sesión</h1>
                    <p className="body-font text-neutral-black-50">
                        Debes iniciar sesión para ver tus pedidos
                    </p>
                    <Button variant="primary" onClick={() => router.push('/login')} fullWidth>
                        Iniciar sesión
                    </Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center mt-[130px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-8 w-8 mx-auto mb-3 text-primary-red" />
                    <p className="body-font text-neutral-black-50">Cargando tus pedidos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center mt-[130px] px-4">
                <div className="w-full max-w-md text-center flex flex-col items-center gap-4">
                    <h1 className="text-primary-red">Error</h1>
                    <p className="body-font text-neutral-black-50">{error}</p>
                    <Button variant="primary" onClick={() => window.location.reload()} fullWidth>
                        Reintentar
                    </Button>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen mt-[130px] px-4">
                <div className="max-w-md mx-auto py-16 text-center flex flex-col items-center gap-4">
                    <Package className="w-16 h-16 text-neutral-black-30" />
                    <h1>Aún no tienes pedidos</h1>
                    <p className="body-font text-neutral-black-50">
                        Cuando hagas tu primer pedido, aparecerá aquí con todo el detalle.
                    </p>
                    <Button variant="primary" onClick={() => router.push('/')} className="w-full max-w-xs">
                        Hacer un pedido
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen mt-[130px] mb-[100px] px-4">
            <div className="max-w-[560px] mx-auto flex flex-col gap-3 py-8">
                <h1 className="mb-2">MIS PEDIDOS</h1>

                {orders.map((order) => (
                    <OrderHistoryCard key={order.id} order={order} />
                ))}
            </div>
        </div>
    );
}
