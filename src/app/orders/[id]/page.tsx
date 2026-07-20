"use client";

import { use, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ArrowLeft, MapPin, CreditCard } from "lucide-react";
import { Order } from "@/types/orders";
import { type Location, PropertyType } from "@/types/locations";
import { OrderService } from "@/services/orderService";
import { useRouter } from "next/navigation";
import { useOrderSocket } from "@/hooks/useOrderSocket";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { OrderItemsList, formatCOP } from "@/components/ui/OrderItemsList";
import { OrderComment } from "@/components/ui/OrderComment";
import { OrderAddressRow } from "@/components/ui/OrderAddressRow";
import { PAYMENT_LABELS } from "@/types/worker";
import { cn } from "@/lib/utils";

interface OrderDetailPageProps {
    params: Promise<{ id: string }>;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function toDeliveryLocation(d: NonNullable<Order["deliveryAddress"]>): Location {
    return {
        name: d.name,
        address: d.address,
        city: d.city,
        country: d.country,
        floor: d.floor ?? "",
        comment: d.comment ?? "",
        coordinates: d.coordinates,
        propertyType: "house" as PropertyType,
    } as unknown as Location;
}

function SectionCard({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("border border-gray-200 rounded-2xl", className)}>
            {children}
        </div>
    );
}

function SectionLabel({ icon, children, className }: { icon?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {icon}
            <p className="text-xs text-neutral-400 uppercase font-bold tracking-wide">{children}</p>
        </div>
    );
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
    const { id } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);

    const { orderUpdate } = useOrderSocket(id);

    useEffect(() => {
        if (!orderUpdate) return;
        setOrder((prev) => (prev ? { ...prev, status: orderUpdate.status } : prev));
    }, [orderUpdate]);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { router.replace("/login"); return; }

        const fetchOrder = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const token = await user.getIdToken();
                const response = await OrderService.getOrderById(id, token);
                setOrder(response.body);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error al cargar el pedido");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [authLoading, user, id, router]);

    const handleCancelOrder = async () => {
        if (!order || !user) return;
        try {
            setCancelling(true);
            const token = await user.getIdToken();
            const response = await OrderService.cancelOrder(order.id, token);
            setOrder(response.body);
        } catch {
            // silent — order stays as-is
        } finally {
            setCancelling(false);
        }
    };

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

    const canCancel = order.status === "fresh";

    return (
        <div className="min-h-screen bg-white mt-[130px]">
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-700" />
                    </button>
                    <h1 className="text-lg font-bold text-neutral-800 uppercase">
                        Detalle del Pedido
                    </h1>
                </div>

                {/* Estado y número de pedido */}
                <SectionCard className="p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-neutral-400 uppercase font-bold tracking-wide">
                                Pedido N°
                            </p>
                            <p className="text-xl font-bold text-neutral-800">{order.orderNumber}</p>
                            <p className="text-xs text-neutral-400 mt-1">{formatDate(order.createdAt)}</p>
                        </div>
                        <OrderStatusBadge status={order.status} />
                    </div>

                    {canCancel && (
                        <button
                            onClick={handleCancelOrder}
                            disabled={cancelling}
                            className="mt-4 w-full py-2.5 rounded-full border border-red-400 text-red-500 text-sm font-bold uppercase hover:bg-red-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                            Cancelar Pedido
                        </button>
                    )}
                </SectionCard>

                {/* Productos */}
                <SectionCard className="px-5">
                    <div className="py-4 border-b border-gray-100">
                        <SectionLabel>Productos</SectionLabel>
                    </div>
                    <OrderItemsList items={order.orderItems} className="py-4" />
                </SectionCard>

                {/* Dirección de entrega */}
                {order.deliveryAddress && (
                    <SectionCard className="p-5">
                        <SectionLabel
                            icon={<MapPin className="w-4 h-4 text-[#e73533]" />}
                            className="mb-4"
                        >
                            Dirección de Entrega
                        </SectionLabel>
                        <OrderAddressRow location={toDeliveryLocation(order.deliveryAddress)} />
                    </SectionCard>
                )}

                {/* Resumen del pago */}
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

                {/* Método de pago */}
                <SectionCard className="p-5">
                    <SectionLabel
                        icon={<CreditCard className="w-4 h-4 text-neutral-400" />}
                        className="mb-3"
                    >
                        Método de Pago
                    </SectionLabel>
                    <p className="text-sm font-semibold text-neutral-800">
                        {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                    </p>
                </SectionCard>

                {/* Comentario */}
                {order.comment && <OrderComment comment={order.comment} />}

                <div className="pb-8" />
            </div>
        </div>
    );
}
