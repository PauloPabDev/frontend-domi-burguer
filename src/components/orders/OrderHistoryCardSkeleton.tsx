import { Skeleton } from "@/components/ui/skeleton";

// Fallback de OrderHistoryCard: fecha + estado, miniaturas 48px + total, y pie con botón
export function OrderHistoryCardSkeleton() {
    return (
        <div role="status" aria-label="Cargando pedido" className="w-full bg-white rounded-2xl p-3.5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            <div className="flex items-center justify-between gap-3">
                <div className="flex gap-1.5">
                    <Skeleton className="w-12 h-12 rounded-[7.66px]" />
                    <Skeleton className="w-12 h-12 rounded-[7.66px]" />
                    <Skeleton className="w-12 h-12 rounded-[7.66px]" />
                </div>
                <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-6 w-20" />
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-neutral-black-10 pt-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-9 w-28 rounded-full" />
            </div>
        </div>
    );
}
