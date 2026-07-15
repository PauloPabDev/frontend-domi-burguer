import { WorkerOrder } from '@/types/worker';

export interface ProductStat {
  name: string;
  quantity: number;
  total: number;
  image?: string;
}

export interface CourierStat {
  name: string;
  photoURL?: string;
  orderCount: number;
  totalDelivery: number;
  cashCollected: number;
  cashOrderCount: number;
  netToHandOver: number;
  digitalDeliveryOwed: number;
  digitalOrderCount: number;
}

export interface KitchenStat {
  name: string;
  orderCount: number;
  total: number;
}

export interface PaymentMethodStat {
  count: number;
  total: number;
}

export interface ContabilidadStats {
  totalSales: number;
  totalInvoiced: number;
  totalNotInvoiced: number;
  totalProductsSold: number;
  deliveryCount: number;
  totalDeliveryCost: number;
  totalDeliverySales: number;
  avgOrderValue: number;
  salesByPaymentMethod: Record<string, PaymentMethodStat>;
  productsSold: Record<string, ProductStat>;
  salesByCourier: Record<string, CourierStat>;
  salesByKitchen: Record<string, KitchenStat>;
}

export const calculateStats = (orders: WorkerOrder[]): ContabilidadStats => {
  const invoiced = orders.filter((o) => o.status === 'invoiced');
  let totalSales = 0;
  let totalProductsSold = 0;
  let deliveryCount = 0;
  let totalDeliveryCost = 0;
  let totalDeliverySales = 0;

  const salesByPaymentMethod: Record<string, PaymentMethodStat> = {};
  const productsSold: Record<string, ProductStat> = {};
  const salesByCourier: Record<string, CourierStat> = {};
  const salesByKitchen: Record<string, KitchenStat> = {};

  invoiced.forEach((order) => {
    totalSales += order.totalPrice ?? 0;

    const pm = order.paymentMethod ?? 'desconocido';
    if (!salesByPaymentMethod[pm]) salesByPaymentMethod[pm] = { count: 0, total: 0 };
    salesByPaymentMethod[pm].count++;
    salesByPaymentMethod[pm].total += order.totalPrice ?? 0;

    order.orderItems?.forEach((item) => {
      const qty = item.quantity ?? 1;
      totalProductsSold += qty;
      if (!productsSold[item.id]) {
        productsSold[item.id] = { name: item.name, quantity: 0, total: 0, image: item.image1 };
      }
      productsSold[item.id].quantity += qty;
      productsSold[item.id].total += (item.price ?? 0) * qty;

      item.complements?.forEach((comp) => {
        const cqty = comp.quantity ?? 1;
        totalProductsSold += cqty;
        const key = `comp:${comp.name}`;
        if (!productsSold[key]) {
          productsSold[key] = { name: comp.name, quantity: 0, total: 0 };
        }
        productsSold[key].quantity += cqty;
        productsSold[key].total += (comp.price ?? 0) * cqty;
      });
    });

    if (order.deliveryPrice && order.deliveryPrice > 0) {
      deliveryCount++;
      totalDeliverySales += order.totalPrice ?? 0;
      totalDeliveryCost += order.deliveryPrice;
    }

    if (order.assignedCourierUserId) {
      if (!salesByCourier[order.assignedCourierUserId]) {
        salesByCourier[order.assignedCourierUserId] = {
          name: order.courier?.name || 'Desconocido',
          photoURL: order.courier?.photoURL,
          orderCount: 0,
          totalDelivery: 0,
          cashCollected: 0,
          cashOrderCount: 0,
          netToHandOver: 0,
          digitalDeliveryOwed: 0,
          digitalOrderCount: 0,
        };
      }
      const stat = salesByCourier[order.assignedCourierUserId];
      stat.orderCount++;
      stat.totalDelivery += order.deliveryPrice ?? 0;
      if ((order.paymentMethod ?? '') === 'cash') {
        stat.cashCollected += order.totalPrice ?? 0;
        stat.cashOrderCount++;
      } else if (order.deliveryPrice && order.deliveryPrice > 0) {
        stat.digitalDeliveryOwed += order.deliveryPrice;
        stat.digitalOrderCount++;
      }
      stat.netToHandOver = stat.cashCollected - stat.totalDelivery;
    }

    if (order.kitchenId && order.kitchen) {
      if (!salesByKitchen[order.kitchenId]) {
        salesByKitchen[order.kitchenId] = { name: order.kitchen.name, orderCount: 0, total: 0 };
      }
      salesByKitchen[order.kitchenId].orderCount++;
      salesByKitchen[order.kitchenId].total += order.totalPrice ?? 0;
    }
  });

  return {
    totalSales,
    totalInvoiced: invoiced.length,
    totalNotInvoiced: orders.length - invoiced.length,
    totalProductsSold,
    deliveryCount,
    totalDeliveryCost,
    totalDeliverySales,
    avgOrderValue: invoiced.length > 0 ? totalSales / invoiced.length : 0,
    salesByPaymentMethod,
    productsSold,
    salesByCourier,
    salesByKitchen,
  };
};
