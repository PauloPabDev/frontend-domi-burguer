"use client";

import Link from "next/link";
import { Order } from "@/types/orders";
import { OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { OrderAddressRow } from "@/components/ui/OrderAddressRow";
import { OrderItemsList, formatCOP } from "@/components/ui/OrderItemsList";
import { formatDateTime } from "@/lib/dates";

interface ProfileOrderCardProps {
  order: Order;
}

export function ProfileOrderCard({ order }: ProfileOrderCardProps) {
  const hasLocation = Boolean(order.location || order.deliveryAddress);

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block rounded-xl border border-gray-200 hover:border-gray-300 transition-colors p-4 space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-neutral-500">{formatDateTime(order.createdAt)}</span>
        <OrderStatusBadge status={order.status} className="text-[10px] px-2 py-1" />
      </div>

      <OrderItemsList items={order.orderItems} />

      {hasLocation && (
        <OrderAddressRow
          location={order.location}
          address={order.deliveryAddress?.address}
          floor={order.deliveryAddress?.floor}
          compact
        />
      )}

      <div className="flex items-center justify-between border-t border-gray-200 pt-2">
        <span className="text-sm text-neutral-500">Total</span>
        <span className="font-bold text-neutral-800">{formatCOP(order.totalPrice ?? 0)}</span>
      </div>
    </Link>
  );
}
