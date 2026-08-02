import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Order } from "@/types/orders";
import { OrderService } from "@/services/orderService";
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
                setOrder(response.body);
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
