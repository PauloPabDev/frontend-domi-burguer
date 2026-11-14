import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Order } from "@/types/orders";
import { OrderService } from "@/services/orderService";
import { LocationService } from "@/services/locationService";
import { useOrderSocket } from "@/hooks/useOrderSocket";

export function useOrderDetail(orderId: string) {
    const { user } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { orderUpdate } = useOrderSocket(orderId);

    useEffect(() => {
        if (!orderUpdate) return;
        setOrder((prev) => (prev ? { ...prev, status: orderUpdate.status } : prev));
    }, [orderUpdate]);

    useEffect(() => {
        if (!user) return;

        const fetchOrder = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const token = await user.getIdToken();
                const response = await OrderService.getOrderById(orderId, token);
                let fetched = response.body;

                // El pedido puede traer solo locationId: se resuelve la dirección para mostrar el mapa
                if ((!fetched.deliveryAddress || !fetched.location) && fetched.locationId) {
                    try {
                        const { body: loc } = await LocationService.getByIdAuthenticated(fetched.locationId, token);
                        fetched = {
                            ...fetched,
                            location: fetched.location ?? loc,
                            deliveryAddress: fetched.deliveryAddress ?? {
                                name: loc.name,
                                address: loc.address,
                                city: loc.city,
                                country: loc.country,
                                floor: loc.floor || undefined,
                                coordinates: loc.coordinates,
                                deliveryPrice: fetched.deliveryPrice ?? 0,
                                comment: loc.comment || undefined,
                            },
                        };
                    } catch {
                        // sin dirección: la tarjeta simplemente no se muestra
                    }
                }

                setOrder(fetched);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error al cargar el pedido");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [user, orderId]);

    return { order, isLoading, error };
}
