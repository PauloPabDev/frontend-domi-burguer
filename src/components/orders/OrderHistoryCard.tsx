"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/ProductImage";
import { formatCOP } from "@/components/ui/OrderItemsList";
import { getStatusPresentation } from "@/app/orders/[id]/utils";
import { getProductImage } from "@/data/products";
import { formatDateTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { Order } from "@/types/orders";


const MAX_VISIBLE = 4;

// Tarjeta de pedido histórico: qué pidió (fotos), cuánto fue (total) y volver a pedir.
export function OrderHistoryCard({ order }: { order: Order }) {
    const [showSoon, setShowSoon] = useState(false);
    const status = getStatusPresentation(order.status);
    const visible = order.orderItems.slice(0, MAX_VISIBLE);
    const remaining = order.orderItems.length - MAX_VISIBLE;

    const units = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="w-full bg-white rounded-2xl p-3.5 shadow-sm flex flex-col gap-3">
            <Link href={`/orders/${order.id}`} className="flex flex-col gap-3 group">
                <div className="flex items-center justify-between gap-3">
                    <h4 className="truncate">{formatDateTime(order.createdAt)}</h4>
                    <span className={cn("shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold", status.bg, status.border, status.text)}>
                        {status.label}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5 min-w-0">
                        {visible.map((item, index) => (
                            <div key={`${item.id}-${index}`} className="relative">
                                {getProductImage(item.id) ? (
                                    <ProductImage src={getProductImage(item.id)!} alt={item.name ?? ""} className="w-12 h-12" sizes="48px" />
                                ) : (
                                    <div className="w-12 h-12 rounded-[7.66px] bg-accent-yellow-40 flex items-center justify-center text-neutral-black-50">
                                        <Package className="w-5 h-5" />
                                    </div>
                                )}
                                {item.quantity > 1 && (
                                    <span className="absolute -top-1.5 -right-1.5 rounded-full bg-neutral-black-80 px-1.5 text-[11px] font-bold leading-5 text-white">
                                        ×{item.quantity}
                                    </span>
                                )}
                            </div>
                        ))}
                        {remaining > 0 && (
                            <div className="w-12 h-12 rounded-[7.66px] bg-neutral-black-10 flex items-center justify-center text-sm font-bold text-neutral-black-80">
                                +{remaining}
                            </div>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                        <div className="flex flex-col items-end leading-tight">
                            <span className="text-xs text-neutral-black-50">Total</span>
                            <h3>{formatCOP(order.totalPrice ?? 0)}</h3>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-black-50 transition-transform group-hover:translate-x-0.5" />
                    </div>
                </div>
            </Link>

            <div className="flex items-center justify-between gap-3 border-t border-neutral-black-10 pt-3">
                <span className="body-font text-neutral-black-50 text-sm">
                    {showSoon ? "Próximamente" : `${units} ${units === 1 ? "producto" : "productos"}`}
                </span>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                        setShowSoon(true);
                        setTimeout(() => setShowSoon(false), 2500);
                    }}
                >
                    Volver a pedir
                </Button>
            </div>
        </div>
    );
}
