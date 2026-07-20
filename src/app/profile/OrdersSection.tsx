"use client";

import { Loader2, ChevronRight, Pencil } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { Order, OrderStatus } from "@/types/orders";
import { OrderService } from "@/services/orderService";
import Image from "next/image";
import Link from "next/link";

function formatPrice(price: number): string {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

function OrderImages({ items }: { items: Order["orderItems"] }) {
    const maxVisible = 2;
    const visibleItems = items.slice(0, maxVisible);
    const remainingCount = items.length - maxVisible;

    return (
        <div className="flex items-center">
            {visibleItems.map((item, index) => (
                <div
                    key={item.id}
                    className="w-16 h-16 bg-accent-yellow-40 rounded-lg relative flex-shrink-0 overflow-hidden"
                    style={{ marginLeft: index > 0 ? "-8px" : "0" }}
                >
                    {item.image1 ? (
                        <Image
                            src={item.image1}
                            alt={item.name ?? ''}
                            fill
                            className="object-cover"
                            sizes="64px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            ?
                        </div>
                    )}
                </div>
            ))}
            {remainingCount > 0 && (
                <div
                    className="w-16 h-16 bg-accent-yellow-40 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ marginLeft: "-8px" }}
                >
                    <span className="text-neutral-800 font-bold text-sm">
                        +{remainingCount}
                    </span>
                </div>
            )}
        </div>
    );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
    const statusInfo = OrderService.getOrderStatusInfo(status);

    return (
        <div
            className={`px-4 py-2 rounded-full font-bold text-xs uppercase ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor ? `border-2 ${statusInfo.borderColor}` : ""}`}
        >
            {statusInfo.label}
        </div>
    );
}

function OrderCard({ order }: { order: Order }) {
    const isDelivered = order.status === "delivered";

    return (
        <div className="border-b border-gray-200 py-4 last:border-b-0">
            <div className="flex items-center gap-4">
                <OrderImages items={order.orderItems} />

                <div className="flex-1 min-w-0">
                    <p className="font-bold text-neutral-800 text-sm">
                        PEDIDO N° {order.orderNumber}
                    </p>
                    <p className="font-bold text-neutral-800">
                        {formatPrice(order.totalPrice ?? 0)}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    {isDelivered ? (
                        <Pencil className="w-5 h-5 text-neutral-400" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-neutral-400" />
                    )}
                </div>
            </div>
        </div>
    );
}

export function OrdersSection() {
    const { orders, loading, error } = useOrders();

    return (
        <div className="mb-8">
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wide mb-4">
                MIS PEDIDOS
            </h2>

            {loading ? (
                <div className="flex justify-center py-6">
                    <Loader2 className="animate-spin text-primary-red" size={32} />
                </div>
            ) : error ? (
                <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-neutral-500 text-sm text-center">
                        Error al cargar los pedidos
                    </p>
                </div>
            ) : orders.length === 0 ? (
                <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-neutral-500 text-sm text-center">
                        Aún no tienes pedidos
                    </p>
                </div>
            ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden px-4">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/orders/${order.id}`}
                            className="block hover:bg-gray-50 transition-colors"
                        >
                            <OrderCard order={order} />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
