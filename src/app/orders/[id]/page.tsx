"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ArrowLeft, MapPin } from "lucide-react";
import { Order } from "@/types/orders";
import { OrderService } from "@/services/orderService";
import { useRouter } from "next/navigation";

interface OrderDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
    const { id } = React.use(params);
    const { user } = useAuth();
    const router = useRouter();
    const [order, setOrder] = React.useState<Order | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchOrder = async () => {
            if (!user) {
                router.push('/login');
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const token = await user.getIdToken();
                const response = await OrderService.getOrderById(id, token);
                setOrder(response.body);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Error al cargar el pedido';
                setError(errorMessage);
                console.error('Error fetching order:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [user, id, router]);

    const handleCancelOrder = async () => {
        if (!order || !user) return;

        try {
            const token = await user.getIdToken();
            const response = await OrderService.cancelOrder(order.id, token);
            setOrder(response.body);
        } catch (error) {
            console.error('Error cancelling order:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando detalles del pedido...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md p-8 text-center">
                    <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
                    <p className="text-gray-600 mb-6">{error || 'Pedido no encontrado'}</p>
                    <Button onClick={() => router.push('/orders')} className="w-full">
                        Volver a Mis Pedidos
                    </Button>
                </Card>
            </div>
        );
    }

    const statusInfo = OrderService.getOrderStatusInfo(order.status);
    const canCancel = ['pending', 'confirmed'].includes(order.status);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/orders')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                    </Button>
                    <h1 className="text-3xl font-bold">Detalles del Pedido</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold">Pedido #{order.orderNumber}</h2>
                                        <p className="text-gray-600 text-sm">
                                            {new Date(order.createdAt).toLocaleDateString('es-CO', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor} border`}>
                                        {statusInfo.label}
                                    </div>
                                </div>

                                {canCancel && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleCancelOrder}
                                        className="w-full"
                                    >
                                        Cancelar Pedido
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Customer Information */}


                        {/* Delivery Address */}
                        {order.deliveryAddress && (
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        Dirección de Entrega
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="font-medium">{order.deliveryAddress.name}</p>
                                            <p className="text-gray-600">{order.deliveryAddress.address}</p>
                                            {order.deliveryAddress.floor && (
                                                <p className="text-gray-600">{order.deliveryAddress.floor}</p>
                                            )}
                                            <p className="text-gray-600">
                                                {order.deliveryAddress.city}, {order.deliveryAddress.country}
                                            </p>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Precio de envío:</span>
                                            <span>${(order.deliveryPrice ?? 0).toLocaleString('es-CO')}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}


                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold mb-4">Resumen del Pedido</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>${(order.subtotal ?? 0).toLocaleString('es-CO')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Envío:</span>
                                        <span>${(order.deliveryPrice ?? 0).toLocaleString('es-CO')}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Total:</span>
                                        <span>${(order.totalPrice ?? 0).toLocaleString('es-CO')}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold mb-4">Método de Pago</h3>
                                <div className="space-y-2">
                                    <p className="capitalize">
                                        {order.paymentMethod === 'cash' && 'Efectivo'}
                                        {order.paymentMethod === 'bancolombia' && 'Bancolombia'}
                                        {order.paymentMethod === 'nequi' && 'Nequi'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {order.comment && (
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="font-semibold mb-4">Comentarios</h3>
                                    <p className="text-gray-600">{order.comment}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}