import { Skeleton } from "@/components/ui/skeleton";
import { OrderHistoryCardSkeleton } from "@/components/orders/OrderHistoryCardSkeleton";

// Mismo contenedor que la página: saludo + email + botón, pedidos y bloques de sección
export function ProfileSkeleton() {
    return (
        <div role="status" aria-label="Cargando perfil" className="mt-8 lg:mt-[130px] min-h-screen bg-white py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <Skeleton className="h-8 w-44 md:h-9" />
                        <Skeleton className="h-5 w-52 mt-1" />
                    </div>
                    <Skeleton className="h-9 w-36" />
                </div>

                <div className="mb-8">
                    <Skeleton className="h-5 w-28 mb-4" />
                    <div className="space-y-3">
                        <OrderHistoryCardSkeleton />
                        <OrderHistoryCardSkeleton />
                    </div>
                </div>

                {[0, 1, 2].map((i) => (
                    <div key={i} className="mb-8">
                        <Skeleton className="h-5 w-28 mb-4" />
                        <Skeleton className="h-[74px] rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    );
}
