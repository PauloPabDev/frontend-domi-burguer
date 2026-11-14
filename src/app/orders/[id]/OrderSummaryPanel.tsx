"use client";

import Image from "next/image";
import { CreditCard } from "lucide-react";
import { Order } from "@/types/orders";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SpikesIcon } from "@/components/ui/icons";
import { ProductImage } from "@/components/ui/ProductImage";
import { formatCOP } from "@/components/ui/OrderItemsList";
import { PAYMENT_LOGOS } from "@/components/ui/OrderPaymentRow";
import { getProductImage } from "@/data/products";
import { useProducts } from "@/contexts/ProductsContext";
import { PAYMENT_LABELS } from "@/types/worker";

export function OrderSummaryPanel({ order }: { order: Order }) {
    const { products } = useProducts();

    return (
        <Card className="flex-col shadow-none bg-transparent! rounded-2xl flex items-start w-full border-0">
            <SpikesIcon className="w-full" />
            <CardContent className="p-0 w-full">
                <div className="px-6 py-2 bg-accent-yellow-10 flex flex-col items-start gap-6 w-full">
                    <h2 className="mt-[-1.00px]">RESUMEN DEL PEDIDO</h2>

                    <ul className="flex flex-col gap-3 w-full">
                        {order.orderItems.map((item, index) => {
                            const product = products.get(item.id);
                            const image = getProductImage(item.id);
                            const name = product?.name ?? item.name ?? "Producto";
                            const color = product?.colorPrimary ?? item.colorPrimary ?? "var(--color-primary-red)";
                            const unitPrice = item.price ?? product?.price ?? 0;

                            return (
                                <li key={index} className="flex flex-col gap-2 w-full bg-white rounded-[12px] p-3 shadow-sm">
                                    <div className="flex items-center gap-3 w-full">
                                        {image && <ProductImage src={image} alt={name} className="w-14 h-14" sizes="56px" />}
                                        <div className="flex flex-col flex-1 min-w-0 gap-1">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span
                                                    className="min-w-6 h-6 px-1.5 rounded-full text-white text-sm font-bold flex items-center justify-center shrink-0"
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {item.quantity}
                                                </span>
                                                <p className="font-h2 break-words">{name}</p>
                                            </div>
                                            {item.quantity > 1 && (
                                                <p className="body-font text-neutral-black-50 text-sm">
                                                    {item.quantity} × {formatCOP(unitPrice)}
                                                </p>
                                            )}
                                        </div>
                                        <p className="font-h2 shrink-0">{formatCOP(unitPrice * item.quantity)}</p>
                                    </div>

                                    {item.complements && item.complements.length > 0 && (
                                        <ul className="flex flex-col gap-1.5 border-t border-dashed border-neutral-black-20 pt-2">
                                            {item.complements.map((c, i) => {
                                                const comp = products.get(c.id);
                                                const qty = c.quantity || 1;
                                                const price = c.price ?? comp?.price ?? 0;
                                                return (
                                                    <li key={i} className="flex items-center justify-between gap-2 body-font">
                                                        <span className="min-w-0 break-words">
                                                            <span className="font-bold">+ {qty}×</span> {comp?.name ?? c.name}
                                                        </span>
                                                        <span className="shrink-0 font-semibold">{formatCOP(price * qty)}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}

                                    {item.notes && (
                                        <p className="body-font italic text-neutral-black-50 border-l-2 border-neutral-black-20 pl-2">
                                            “{item.notes}”
                                        </p>
                                    )}
                                </li>
                            );
                        })}
                    </ul>

                    <div className="flex flex-col gap-4 w-full">
                        <Separator orientation="horizontal" className="w-full!" />

                        <div className="flex items-center gap-10 w-full">
                            <p className="flex-1 body-font font-bold">Total</p>
                            <h2 className="w-fit">{formatCOP(order.totalPrice ?? 0)}</h2>
                        </div>

                        <div className="flex items-center gap-10 w-full">
                            <p className="flex-1 body-font font-bold">Método de pago</p>
                            <div className="flex items-center gap-2">
                                {PAYMENT_LOGOS[order.paymentMethod] ? (
                                    <Image src={PAYMENT_LOGOS[order.paymentMethod].src} alt="" width={28} height={28} className="object-contain rounded-sm" />
                                ) : (
                                    <CreditCard className="w-6 h-6 text-neutral-black-80" />
                                )}
                                <h2>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <SpikesIcon className="w-full rotate-180" />
        </Card>
    );
}
