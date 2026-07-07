'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductsContext';
import { WorkerOrder, WorkerKitchen } from '@/types/worker';
import { DeliveryAddress, OrderItem, OrderComplement } from '@/types/orders';
import { Location } from '@/types/locations';
import { Product } from '@/types/product';
import { ClientService } from '@/services/clientService';
import { LocationService } from '@/services/locationService';
import { UserService } from '@/services/userService';

type CourierInfo = NonNullable<WorkerOrder['courier']>;
type ClientInfo = NonNullable<WorkerOrder['client']>;

function resolveItemNames(
  items: OrderItem[],
  productMap: Map<string, Product>,
): OrderItem[] {
  return items.map((item) => {
    const product = productMap.get(item.name); // item.name holds the raw product ID
    const resolvedName = product?.name ?? item.name;

    const resolvedComplements = item.complements?.map((c): OrderComplement => {
      const comp = productMap.get(c.name); // c.name holds the raw complement ID
      return comp ? { ...c, name: comp.name } : c;
    });

    if (
      resolvedName === item.name &&
      (!resolvedComplements || resolvedComplements.every((c, i) => c === item.complements![i]))
    ) {
      return item;
    }

    return {
      ...item,
      name: resolvedName,
      ...(resolvedComplements && { complements: resolvedComplements }),
    };
  });
}

//agrupa la información de las órdenes con la información de cocinas, productos, repartidores, clientes y direcciones etc
function applyEnrichment(
  orders: WorkerOrder[],
  kitchens: WorkerKitchen[],
  productMap: Map<string, Product>,
  courierCache: Map<string, CourierInfo>,
  clientCache: Map<string, ClientInfo>,
  locCache: Map<string, DeliveryAddress>,
  locationObjCache: Map<string, Location>,
): WorkerOrder[] {
  return orders.map((order) => {
    const kitchen =
      order.kitchen ??
      (order.kitchenId ? kitchens.find((k) => k.id === order.kitchenId) ?? undefined : undefined);
    const courier =
      order.courier ?? (order.courierId ? courierCache.get(order.courierId) : undefined);
    const client =
      order.client ?? (order.clientId ? clientCache.get(order.clientId) : undefined);
    const deliveryAddress =
      order.deliveryAddress ?? (order.locationId ? locCache.get(order.locationId) : undefined);
    const location =
      order.location ?? (order.locationId ? locationObjCache.get(order.locationId) : undefined);
    const orderItems = productMap.size > 0 ? resolveItemNames(order.orderItems, productMap) : order.orderItems;

    if (
      kitchen === order.kitchen &&
      courier === order.courier &&
      client === order.client &&
      deliveryAddress === order.deliveryAddress &&
      location === order.location &&
      orderItems === order.orderItems
    ) {
      return order;
    }

    return {
      ...order,
      orderItems,
      ...(kitchen && { kitchen: { id: kitchen.id, name: kitchen.name } }),
      ...(courier && { courier }),
      ...(client && { client }),
      ...(deliveryAddress && { deliveryAddress }),
      ...(location && { location }),
    };
  });
}

// Sólo reemplaza el estado si alguna referencia cambió para evitar re-renders infinitos
function setIfChanged(
  prev: WorkerOrder[],
  next: WorkerOrder[],
): WorkerOrder[] {
  if (prev.length === next.length && next.every((o, i) => o === prev[i])) return prev;
  return next;
}

export function useEnrichedOrders(
  orders: WorkerOrder[],
  kitchens: WorkerKitchen[] = [],
): WorkerOrder[] {
  const { user } = useAuth();
  const { products } = useProducts();
  const [enriched, setEnriched] = useState<WorkerOrder[]>(orders);

  const courierCache = useRef<Map<string, CourierInfo>>(new Map());
  const clientCache = useRef<Map<string, ClientInfo>>(new Map());
  const locCache = useRef<Map<string, DeliveryAddress>>(new Map());
  const locationObjCache = useRef<Map<string, Location>>(new Map());
  const inFlight = useRef<Set<string>>(new Set());

  // Guardamos kitchens en un ref para no meterlo en el dep array:
  // el valor por defecto `[]` crea una nueva referencia en cada render,
  // lo que causaría un loop infinito si estuviera en deps.
  const kitchensRef = useRef<WorkerKitchen[]>(kitchens);
  kitchensRef.current = kitchens;

  useEffect(() => {
    const syncResult = applyEnrichment(
      orders,
      kitchensRef.current,
      products,
      courierCache.current,
      clientCache.current,
      locCache.current,
      locationObjCache.current,
    );

    // Comparación por referencia: si ningún elemento cambió, no actualizamos estado
    setEnriched((prev) => setIfChanged(prev, syncResult));

    if (!user) return;

    const missingCouriers = new Set<string>();
    const missingClients = new Set<string>();
    const missingLocations = new Set<string>();

    for (const order of syncResult) {
      if (order.courierId && !order.courier && !courierCache.current.has(order.courierId) && !inFlight.current.has(`courier:${order.courierId}`)) {
        missingCouriers.add(order.courierId);
      }
      if (order.clientId && !order.client && !clientCache.current.has(order.clientId) && !inFlight.current.has(`client:${order.clientId}`)) {
        missingClients.add(order.clientId);
      }
      if (order.locationId && (!order.deliveryAddress || !order.location) && !locCache.current.has(order.locationId) && !inFlight.current.has(`location:${order.locationId}`)) {
        missingLocations.add(order.locationId);
      }
    }

    if (missingCouriers.size === 0 && missingClients.size === 0 && missingLocations.size === 0) return;

    let cancelled = false;

    const fetchAll = async () => {
      const token = await user.getIdToken();
      const promises: Promise<void>[] = [];

      for (const id of missingCouriers) {
        inFlight.current.add(`courier:${id}`);
        promises.push(
          UserService.getUserById(id, token)
            .then(({ body }) => {
              courierCache.current.set(id, { id: body.id, name: body.name, photoURL: body.photoUrl });
            })
            .catch(() => { })
            .finally(() => inFlight.current.delete(`courier:${id}`)),
        );
      }

      for (const id of missingClients) {
        inFlight.current.add(`client:${id}`);
        promises.push(
          ClientService.getById(id, token)
            .then(({ body }) => {
              clientCache.current.set(id, { name: body.name, phone: body.phone, email: body.email, photoURL: body.photoUrl });
            })
            .catch(() => { })
            .finally(() => inFlight.current.delete(`client:${id}`)),
        );
      }

      for (const id of missingLocations) {
        inFlight.current.add(`location:${id}`);
        promises.push(
          LocationService.getByIdAuthenticated(id, token)
            .then(({ body }) => {
              locCache.current.set(id, {
                name: body.name,
                address: body.address,
                city: body.city,
                country: body.country,
                floor: body.floor || undefined,
                coordinates: body.coordinates,
                deliveryPrice: 0,
                comment: body.comment || undefined,
              });
              locationObjCache.current.set(id, body);
            })
            .catch(() => { })
            .finally(() => inFlight.current.delete(`location:${id}`)),
        );
      }

      await Promise.allSettled(promises);

      if (!cancelled) {
        setEnriched((prev) =>
          setIfChanged(
            prev,
            applyEnrichment(orders, kitchensRef.current, products, courierCache.current, clientCache.current, locCache.current, locationObjCache.current),
          ),
        );
      }
    };

    fetchAll();

    return () => { cancelled = true; };
  }, [orders, user, products]); // kitchens se lee via kitchensRef para evitar el loop

  return enriched;
}
