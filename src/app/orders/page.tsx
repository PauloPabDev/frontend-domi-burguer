"use client";

import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Package, ChevronRight } from "lucide-react";
import { Order, OrderItem } from "@/types/orders";
import { useRouter } from "next/navigation";
import { useCartStore, CartItem } from "@/store/cartStore";
import { generateCartItemId } from "@/lib/utils";
import { formatDateTime } from "@/lib/dates";
import { formatCOP } from "@/components/ui/OrderItemsList";
import Image from "next/image";
import Link from "next/link";
import { OrderStatusBanner } from "./[id]/OrderStatusBanner";
import { OrderSummaryPanel } from "./[id]/OrderSummaryPanel";

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
            name: item.name ?? '',
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
            <div className="max-w-[560px] mx-auto flex flex-col gap-12 py-8">
                <h1>MIS PEDIDOS</h1>

                {orders.map((order, index) => (
                    <div key={order.id} className="flex flex-col gap-12">
                        {index > 0 && (
                            <div className="border-t border-dashed border-neutral-black-20" />
                        )}
                        <OrderTicket order={order} onReorder={() => handleReorder(order)} />
                    </div>
                ))}
            </div>
        </div>
    );
}

interface ProductImagesProps {
    items: OrderItem[];
}

function ProductImages({ items }: ProductImagesProps) {
    const maxVisible = 3;
    const visibleItems = items.slice(0, maxVisible);
    const remainingCount = items.length - maxVisible;

    return (
        <div className="flex items-center -space-x-3 shrink-0">
            {visibleItems.map((item, index) => (
                <div
                    key={item.id}
                    className="relative w-14 h-14 rounded-[12px] overflow-hidden bg-accent-yellow-40 border-2 border-white shadow-sm"
                    style={{ zIndex: maxVisible - index }}
                >
                    {item.image1 ? (
                        <Image
                            src={item.image1}
                            alt={item.name ?? ''}
                            fill
                            className="object-cover"
                            sizes="56px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-black-50">
                            <Package className="w-6 h-6" />
                        </div>
                    )}
                </div>
            ))}
            {remainingCount > 0 && (
                <div
                    className="relative w-14 h-14 rounded-[12px] bg-neutral-black-10 border-2 border-white shadow-sm flex items-center justify-center"
                    style={{ zIndex: 0 }}
                >
                    <span className="text-sm font-bold text-neutral-black-80">
                        +{remainingCount}
                    </span>
                </div>
            )}
        </div>
    );
}

interface OrderTicketProps {
    order: Order;
    onReorder: () => void;
}

function OrderTicket({ order, onReorder }: OrderTicketProps) {
    const canReorder = order.status === 'delivered' || order.status === 'invoiced';

    return (
        <div className="flex flex-col gap-4 w-full">
            <Link
                href={`/orders/${order.id}`}
                className="flex items-center justify-between gap-4 w-full group"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <ProductImages items={order.orderItems} />
                    <div className="flex flex-col min-w-0">
                        <h4 className="truncate">Pedido N° {order.orderNumber}</h4>
                        <span className="body-font text-neutral-black-50 text-xs md:text-sm">
                            {formatDateTime(order.createdAt)}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <h4>{formatCOP(order.totalPrice ?? 0)}</h4>
                    <ChevronRight className="w-4 h-4 text-neutral-black-50 transition-transform group-hover:translate-x-0.5" />
                </div>
            </Link>

            <OrderStatusBanner status={order.status} />

            <OrderSummaryPanel order={order} />

            {canReorder && (
                <Button variant="primary" onClick={onReorder} fullWidth>
                    Comprar de nuevo
                </Button>
            )}
        </div>
    );
}
