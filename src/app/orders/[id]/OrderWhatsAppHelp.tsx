"use client";

import Link from "next/link";
import { WhatsAppIcon } from "@/components/ui/icons";

interface OrderWhatsAppHelpProps {
    orderNumber: string;
}

export function OrderWhatsAppHelp({ orderNumber }: OrderWhatsAppHelpProps) {
    const message = encodeURIComponent(`Hola, tengo una duda sobre mi pedido N° ${orderNumber}`);

    return (
        <Link
            href={`https://wa.me/573506186772?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            data-umami-event="order_detail_whatsapp_clicked"
            className="flex items-center gap-2 body-font text-neutral-black-50 hover:text-neutral-black-80 transition-colors w-fit"
        >
            <WhatsAppIcon width={18} height={18} />
            ¿Tienes dudas? Contáctanos por WhatsApp
        </Link>
    );
}
