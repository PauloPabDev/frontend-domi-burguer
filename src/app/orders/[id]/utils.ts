import { DeliveryAddress, OrderStatus } from "@/types/orders";
import { type Location, PropertyType } from "@/types/locations";

export function toDeliveryLocation(address: DeliveryAddress): Location {
    return {
        name: address.name,
        address: address.address,
        city: address.city,
        country: address.country,
        floor: address.floor ?? "",
        comment: address.comment ?? "",
        coordinates: address.coordinates,
        propertyType: "house" as PropertyType,
    } as unknown as Location;
}

export interface OrderStatusPresentation {
    label: string;
    message: string;
    bg: string;
    border: string;
    text: string;
}

export const ORDER_STATUS_PRESENTATION: Record<OrderStatus, OrderStatusPresentation> = {
    fresh: {
        label: "Pedido recibido",
        message: "Hemos recibido tu pedido y en breve comenzaremos a prepararlo.",
        bg: "bg-sky-50",
        border: "border-sky-300",
        text: "text-sky-700",
    },
    preparing: {
        label: "Preparando tu pedido",
        message: "Tu pedido ya fue aprobado en cocina. Te avisaremos cuando salga a reparto.",
        bg: "bg-violet-50",
        border: "border-violet-300",
        text: "text-violet-700",
    },
    ready_for_pickup: {
        label: "Listo para despacho",
        message: "Tu pedido está listo y pronto saldrá hacia tu dirección.",
        bg: "bg-pink-50",
        border: "border-pink-300",
        text: "text-pink-700",
    },
    dispatched: {
        label: "En camino",
        message: "¡Tu pedido va en camino! Nuestro domiciliario ya lo está llevando a tu dirección.",
        bg: "bg-orange-50",
        border: "border-orange-300",
        text: "text-orange-700",
    },
    delivered: {
        label: "Entregado",
        message: "Tu pedido fue entregado. ¡Buen provecho!",
        bg: "bg-green-50",
        border: "border-green-300",
        text: "text-green-700",
    },
    invoiced: {
        label: "Facturado",
        message: "Tu pedido fue facturado correctamente.",
        bg: "bg-emerald-50",
        border: "border-emerald-300",
        text: "text-emerald-700",
    },
    pending_payment: {
        label: "Pago pendiente",
        message: "Estamos verificando tu pago. Te avisaremos apenas se confirme.",
        bg: "bg-red-50",
        border: "border-red-300",
        text: "text-red-800",
    },
    cancelled: {
        label: "Pedido cancelado",
        message: "Este pedido fue cancelado. Si tienes dudas, escríbenos por WhatsApp.",
        bg: "bg-neutral-black-3",
        border: "border-neutral-black-20",
        text: "text-neutral-black-50",
    },
};
