import { OrderHistoryCardSkeleton } from "@/components/orders/OrderHistoryCardSkeleton";

export function OrdersSkeleton() {
    return (
        <div role="status" aria-label="Cargando tus pedidos" className="min-h-screen mt-[130px] mb-[100px] px-4">
            <div className="max-w-[560px] mx-auto flex flex-col gap-3 py-8">
                <h1 className="mb-2">MIS PEDIDOS</h1>

                {[0, 1, 2, 3].map((i) => (
                    <OrderHistoryCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
