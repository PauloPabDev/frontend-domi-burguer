"use client";

import { ArrowLeft } from "lucide-react";
import { formatFullDateTime } from "@/lib/dates";

interface OrderDetailHeaderProps {
    orderNumber: string;
    createdAt: string;
    onBack: () => void;
}

export function OrderDetailHeader({ orderNumber, createdAt, onBack }: OrderDetailHeaderProps) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-full hover:bg-neutral-black-10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-neutral-black-80" />
                </button>
                <h1>MI PEDIDO</h1>
            </div>
            <p className="body-font text-neutral-black-50 ml-11">
                Pedido N° {orderNumber} · {formatFullDateTime(createdAt)}
            </p>
        </div>
    );
}
