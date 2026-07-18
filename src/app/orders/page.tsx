"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Package } from "lucide-react";
import { Order, OrderItem } from "@/types/orders";
import { OrderService } from "@/services/orderService";
import { useRouter } from "next/navigation";
import { useCartStore, CartItem } from "@/store/cartStore";
import { generateCartItemId } from "@/lib/utils";
import Image from "next/image";

export default function OrdersPage() {
    const { orders, loading, error } = useOrders();
    const { user } = useAuth();
    const router = useRouter();
    const addItem = useCartStore((state) => state.addItem);

    const handleReorder = (order: Order) => {
        order.orderItems.forEach((item) => {
            const cartItem = convertOrderItemToCartItem(item);
            addItem(cartItem);
        });
        router.push('/cart');
    };

    const convertOrderItemToCartItem = (item: OrderItem): CartItem => {
        const complements = (item.complements || []).map((c, index) => ({
            id: index,
            name: c.name,
            quantity: c.quantity,
            price: c.price,
            minusComplement: false
        }));

        return {
            id: generateCartItemId(Number(item.id), complements),
            productId: Number(item.id),
            name: item.name,
            price: item.price,
            basePrice: item.price,
            quantity: item.quantity,
            image1: item.image1 || '/placeholder.png',
            image2: item.image2,
            complements,
            allowCustomization: false,
            customizationType: 'none' as const,
        };
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 mt-[130px]">
                <Card className="w-full max-w-md p-8 text-center">
                    <h1 className="text-2xl font-bold mb-4">Inicia sesión</h1>
                    <p className="text-gray-600 mb-6">
                        Debes iniciar sesión para ver tus pedidos
                    </p>
                    <Button onClick={() => router.push('/login')} className="w-full">
                        Iniciar Sesión
                    </Button>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 mt-[130px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando tus pedidos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 mt-[130px]">
                <Card className="w-full max-w-md p-8 text-center">
                    <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Button onClick={() => window.location.reload()} className="w-full">
                        Reintentar
                    </Button>
                </Card>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 mt-[130px]">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <h1 className="text-xl font-bold mb-8 uppercase">Mis Pedidos</h1>
                    <Card className="p-12 text-center">
                        <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-xl font-semibold mb-2">No tienes pedidos aún</h2>
                        <p className="text-gray-600 mb-6">
                            Cuando realices tu primer pedido, aparecerá aquí
                        </p>
                        <Button onClick={() => router.push('/')} className="w-full max-w-xs">
                            Hacer un Pedido
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white mt-[130px]">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-xl font-bold mb-6 uppercase">Mis Pedidos</h1>

                <div className="divide-y divide-gray-200">
                    {orders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onReorder={() => handleReorder(order)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

interface ProductImagesProps {
    items: OrderItem[];
}

function ProductImages({ items }: ProductImagesProps) {
    const maxVisible = 2;
    const visibleItems = items.slice(0, maxVisible);
    const remainingCount = items.length - maxVisible;

    return (
        <div className="flex items-center -space-x-3">
            {visibleItems.map((item, index) => (
                <div
                    key={item.id}
                    className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border-2 border-white shadow-sm"
                    style={{ zIndex: maxVisible - index }}
                >
                    {item.image1 ? (
                        <Image
                            src={item.image1}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-6 h-6" />
                        </div>
                    )}
                </div>
            ))}
            {remainingCount > 0 && (
                <div
                    className="relative w-14 h-14 rounded-lg bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center"
                    style={{ zIndex: 0 }}
                >
                    <span className="text-sm font-semibold text-gray-600">
                        +{remainingCount}
                    </span>
                </div>
            )}
        </div>
    );
}

interface OrderCardProps {
    order: Order;
    onReorder: () => void;
}

function OrderCard({ order, onReorder }: OrderCardProps) {
    const statusInfo = OrderService.getOrderStatusInfo(order.status);

    return (
        <div className="flex items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-4">
                <ProductImages items={order.orderItems} />

                <div className="flex flex-col">
                    <span className="font-semibold text-sm uppercase">
                        Pedido N° {order.orderNumber}
                    </span>
                    <span className="font-bold text-base">
                        ${(order.totalPrice ?? 0).toLocaleString('es-CO')}
                    </span>
                </div>
            </div>

            <div className="flex items-center">
                {statusInfo.isButton ? (
                    <button
                        onClick={onReorder}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor} transition-opacity hover:opacity-90`}
                    >
                        {statusInfo.label}
                    </button>
                ) : (
                    <span
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor}`}
                    >
                        {statusInfo.label}
                    </span>
                )}
            </div>
        </div>
    );
}
