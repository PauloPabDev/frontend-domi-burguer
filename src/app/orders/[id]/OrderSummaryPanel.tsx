"use client";

import { Order } from "@/types/orders";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SpikesIcon } from "@/components/ui/icons";
import { OrderItemsList, formatCOP } from "@/components/ui/OrderItemsList";
import { PAYMENT_LABELS } from "@/types/worker";

interface OrderSummaryPanelProps {
    order: Order;
}

export function OrderSummaryPanel({ order }: OrderSummaryPanelProps) {
    return (
        <Card className="flex-col shadow-none bg-transparent! rounded-2xl flex items-start w-full border-0">
            <SpikesIcon className="w-full" />
            <CardContent className="p-0 w-full">
                <div className="px-6 py-2 bg-accent-yellow-10 flex flex-col items-start gap-8 w-full">
                    <h2 className="mt-[-1.00px]">RESUMEN DEL PEDIDO</h2>

                    <div className="flex flex-col items-start gap-8 w-full">
                        <OrderItemsList items={order.orderItems} className="w-full" />
                        <Separator orientation="horizontal" className="w-full!" />
                    </div>

                    <div className="flex flex-col items-start gap-4 w-full">
                        <div className="flex items-start gap-10 w-full">
                            <p className="flex-1 body-font">Subtotal</p>
                            <p className="w-fit body-font">{formatCOP(order.subtotal ?? 0)}</p>
                        </div>

                        <div className="flex items-start gap-10 w-full">
                            <p className="flex-1 body-font">Envío</p>
                            <p className="w-fit body-font font-bold">{formatCOP(order.deliveryPrice ?? 0)}</p>
                        </div>

                        <Separator orientation="horizontal" className="w-full!" />

                        <div className="flex items-center gap-10 w-full">
                            <p className="flex-1 body-font font-bold">Total</p>
                            <h2 className="w-fit">{formatCOP(order.totalPrice ?? 0)}</h2>
                        </div>

                        <Separator orientation="horizontal" className="w-full!" />

                        <div className="flex items-center gap-10 w-full">
                            <p className="flex-1 body-font font-bold">Método de pago</p>
                            <h2 className="w-fit">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</h2>
                        </div>
                    </div>
                </div>
            </CardContent>
            <SpikesIcon className="w-full rotate-180" />
        </Card>
    );
}
