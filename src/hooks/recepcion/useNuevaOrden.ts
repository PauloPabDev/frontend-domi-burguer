"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ClientService, ApiClient } from '@/services/clientService';
import { LocationService } from '@/services/locationService';
import { WorkerOrderService, DeliveryInfo, KitchenInfo } from '@/services/workerOrderService';
import { Location } from '@/types/locations';
import { Product, Complement } from '@/types/products';
import { WorkerKitchen } from '@/types/worker';
import { PRODUCTS } from '@/data/products';
import { BancolombiaIcon, MoneyIcon, NequiIcon } from '@/components/ui/icons';
import { PaymentMethod } from '@/types/paymentMethod';

export type ClientState = 'idle' | 'loading' | 'found' | 'not_found' | 'creating';

export interface OrderItem {
  itemId: number;
  product: Product;
  complements: Complement[];
  quantity: number;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash',        label: 'Efectivo',    iconClass: 'w-[38px] h-[32px]', icon: MoneyIcon,       selected: true  },
  { id: 'bancolombia', label: 'Bancolombia', iconClass: 'w-[28px] h-[28px]', icon: BancolombiaIcon, selected: false },
  { id: 'nequi',       label: 'Nequi',       iconClass: 'w-[36px] h-[25px]', icon: NequiIcon,       selected: false },
];

export function useNuevaOrden() {
  const { user } = useAuth();

  // Client step
  const [phone, setPhone] = useState('');
  const [clientState, setClientState] = useState<ClientState>('idle');
  const [client, setClient] = useState<ApiClient | null>(null);

  // Location step
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [showCreateLocationModal, setShowCreateLocationModal] = useState(false);

  // Kitchens/sedes
  const [kitchens, setKitchens] = useState<WorkerKitchen[]>([]);
  const [kitchensLoading, setKitchensLoading] = useState(false);

  // Delivery step
  const [delivery, setDelivery] = useState<DeliveryInfo | null>(null);
  const [kitchen, setKitchen] = useState<KitchenInfo | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [selectedKitchenId, setSelectedKitchenId] = useState<string | null>(null);

  // Products step
  const itemIdCounterRef = useRef(0);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
  const [showComplementModal, setShowComplementModal] = useState(false);

  // Form
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch kitchens once when user is available
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchKitchens = async () => {
      setKitchensLoading(true);
      try {
        const token = await user.getIdToken();
        const { body } = await WorkerOrderService.getKitchensList(token);
        if (!cancelled) setKitchens(body);
      } catch {
        // silently ignore
      } finally {
        if (!cancelled) setKitchensLoading(false);
      }
    };
    fetchKitchens();
    return () => { cancelled = true; };
  }, [user]);

  const getToken = useCallback(async () => {
    if (!user) throw new Error('No autenticado');
    return user.getIdToken();
  }, [user]);

  const searchClient = useCallback(async () => {
    if (!phone) return;
    setClientState('loading');
    setClient(null);
    setLocations([]);
    setSelectedLocationId(null);
    setDelivery(null);
    try {
      const token = await getToken();
      const { body } = await ClientService.findByPhone(phone, token);
      setClient(body);
      setClientState('found');
      // Load locations immediately
      setLocationsLoading(true);
      try {
        const locRes = await LocationService.getByClientId(body.id, token);
        setLocations(locRes.body ?? []);
      } finally {
        setLocationsLoading(false);
      }
    } catch {
      setClientState('not_found');
    }
  }, [phone, getToken]);

  const handlePhoneSet = useCallback((incomingPhone: string) => {
    setPhone(incomingPhone);
  }, []);

  const createClient = useCallback(async (name: string) => {
    if (!name || !phone) return;
    setClientState('creating');
    try {
      const token = await getToken();
      const { body } = await ClientService.create({ name, phone }, token);
      setClient(body);
      setClientState('found');
      setLocations([]);
    } catch {
      setClientState('not_found');
    }
  }, [phone, getToken]);

  const loadDelivery = useCallback(async (locationId: string, kitchenIdOverride?: string) => {
    setDeliveryLoading(true);
    setDeliveryError(null);
    setDelivery(null);
    setKitchen(null);
    try {
      const token = await getToken();
      const effectiveKitchenId = kitchenIdOverride !== undefined ? kitchenIdOverride : (selectedKitchenId ?? undefined);
      const { body } = await WorkerOrderService.getSelectKitchen(
        locationId,
        token,
        effectiveKitchenId
      );
      setDelivery(body.delivery);
      setKitchen(body.kitchen);
      if (body.kitchen?.id) setSelectedKitchenId(body.kitchen.id);
    } catch (err) {
      setDeliveryError(err instanceof Error ? err.message : 'Error al calcular delivery');
    } finally {
      setDeliveryLoading(false);
    }
  }, [getToken, selectedKitchenId]);

  const handleSelectLocation = useCallback((id: string) => {
    setSelectedLocationId(id);
    loadDelivery(id);
  }, [loadDelivery]);

  const handleKitchenChange = useCallback((kitchenId: string | null) => {
    setSelectedKitchenId(kitchenId);
    if (selectedLocationId) {
      loadDelivery(selectedLocationId, kitchenId ?? '');
    }
  }, [selectedLocationId, loadDelivery]);

  const handleLocationCreated = useCallback(async (location: Location) => {
    setLocations((prev) => [...prev, location]);
    setShowCreateLocationModal(false);
    handleSelectLocation(location.id);
  }, [handleSelectLocation]);

  const overrideDeliveryPrice = useCallback((price: number) => {
    setDelivery((prev) => prev ? { ...prev, price, modified: true } : prev);
  }, []);

  // Product management — each call to addProduct creates a new independent line item
  const addProduct = useCallback((product: Product) => {
    itemIdCounterRef.current += 1;
    const itemId = itemIdCounterRef.current;
    setOrderItems((prev) => [
      ...prev,
      { itemId, product, complements: [...product.complements], quantity: 1 },
    ]);
  }, []);

  const removeProduct = useCallback((itemId: number) => {
    setOrderItems((prev) => prev.filter((i) => i.itemId !== itemId));
  }, []);

  const changeQuantity = useCallback((itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(itemId);
      return;
    }
    setOrderItems((prev) =>
      prev.map((i) => i.itemId === itemId ? { ...i, quantity } : i)
    );
  }, [removeProduct]);

  const openComplementEditor = useCallback((item: OrderItem) => {
    setEditingItem(item);
    setShowComplementModal(true);
  }, []);

  // Adds a product AND opens the complement editor in the same batch.
  // Returns the new item so the caller can set up pendingComplements refs.
  const addProductAndEdit = useCallback((product: Product): OrderItem => {
    itemIdCounterRef.current += 1;
    const itemId = itemIdCounterRef.current;
    const newItem: OrderItem = { itemId, product, complements: [...product.complements], quantity: 1 };
    setOrderItems((prev) => [...prev, newItem]);
    setEditingItem(newItem);
    setShowComplementModal(true);
    return newItem;
  }, []);

  const confirmComplements = useCallback((complements: Complement[]) => {
    if (!editingItem) return;
    setOrderItems((prev) =>
      prev.map((i) =>
        i.itemId === editingItem.itemId ? { ...i, complements } : i
      )
    );
    setShowComplementModal(false);
    setEditingItem(null);
  }, [editingItem]);

  const handleSubmit = useCallback(async () => {
    if (!client) { setSubmitError('Selecciona un cliente'); return; }
    if (!selectedLocationId) { setSubmitError('Selecciona una dirección'); return; }
    if (!delivery) { setSubmitError('No se pudo calcular el precio de delivery'); return; }
    if (orderItems.length === 0) { setSubmitError('Agrega al menos un producto'); return; }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const builtItems = orderItems.flatMap((item) =>
        Array.from({ length: item.quantity }, () => ({
          id: String(item.product.id),
          ...(item.complements.length > 0
            ? { complements: item.complements.map((c) => ({ id: String(c.id) })) }
            : {}),
        }))
      );

      await WorkerOrderService.createAdminOrder(
        {
          clientId: client.id,
          locationId: selectedLocationId,
          comment,
          paymentMethod,
          orderItems: builtItems,
          delivery: { price: delivery.price, distance: delivery.distance },
          ...(selectedKitchenId ? { assignedKitchenId: selectedKitchenId } : {}),
        },
        token
      );

      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al crear la orden');
    } finally {
      setIsSubmitting(false);
    }
  }, [client, selectedLocationId, delivery, orderItems, comment, paymentMethod, selectedKitchenId, getToken]);

  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const resetForm = useCallback(() => {
    setPhone('');
    setClientState('idle');
    setClient(null);
    setLocations([]);
    setSelectedLocationId(null);
    setDelivery(null);
    setKitchen(null);
    setOrderItems([]);
    setPaymentMethod('cash');
    setComment('');
    setSelectedKitchenId(null);
    setSubmitSuccess(false);
    setSubmitError(null);
  }, []);

  const subtotal = orderItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const total = subtotal + (delivery?.price ?? 0);

  return {
    // Client
    phone, setPhone, clientState, client,
    searchClient, createClient, handlePhoneSet,
    // Kitchens/sedes
    kitchens, kitchensLoading, selectedKitchenId,
    handleKitchenChange,
    // Locations
    locations, locationsLoading, selectedLocationId,
    showCreateLocationModal, setShowCreateLocationModal,
    handleSelectLocation, handleLocationCreated,
    // Delivery
    delivery, kitchen, deliveryLoading, deliveryError, overrideDeliveryPrice,
    // Products
    allProducts: PRODUCTS,
    orderItems, addProduct, removeProduct, changeQuantity,
    editingItem, showComplementModal, setShowComplementModal,
    openComplementEditor, addProductAndEdit, confirmComplements,
    // Form
    paymentMethod, setPaymentMethod,
    comment, setComment,
    isSubmitting, submitError, submitSuccess,
    handleSubmit, resetForm, clearSubmitError,
    // Totals
    subtotal, total,
  };
}
