"use client";

import { ArrowLeft } from "lucide-react";

interface OrderDetailHeaderProps {
    onBack: () => void;
}

export function OrderDetailHeader({ onBack }: OrderDetailHeaderProps) {
    return (
        <div className="flex items-center gap-3 mb-2">
            <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 text-neutral-700" />
            </button>
            <h1 className="text-lg font-bold text-neutral-800 uppercase">
                Detalle del Pedido
            </h1>
        </div>
    );
}
