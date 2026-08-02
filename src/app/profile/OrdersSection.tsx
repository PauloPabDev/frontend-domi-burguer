"use client";

import { useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { useProfileOrders } from "@/hooks/useProfileOrders";
import { ProfileOrderCard } from "./ProfileOrderCard";

const INITIAL_VISIBLE = 2
const PAGE_SIZE = 3;

export function OrdersSection() {
  const { orders, loading, loadingMore, error, hasMore, loadMore } = useProfileOrders(PAGE_SIZE);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  console.log("OrdersSection render", { orders, loading, loadingMore, error, hasMore, visibleCount });
  const visibleOrders = orders.slice(0, visibleCount);
  const canExpandLocally = visibleCount < orders.length;
  const canLoadMore = visibleCount >= orders.length && hasMore;
  const showMoreButton = canExpandLocally || canLoadMore;

  const handleShowMore = async () => {
    if (canExpandLocally) {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, orders.length));
      return;
    }
    if (canLoadMore) {
      await loadMore();
      setVisibleCount((prev) => prev + PAGE_SIZE);
    }
  };

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
        <div className="space-y-3">
          {visibleOrders.map((order) => (
            <ProfileOrderCard key={order.id} order={order} />
          ))}

          {showMoreButton && (
            <button
              type="button"
              onClick={handleShowMore}
              disabled={loadingMore}
              className="flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-800 transition-colors disabled:opacity-50"
            >
              {loadingMore ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              Más...
            </button>
          )}
        </div>
      )}
    </div>
  );
}
