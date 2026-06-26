"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getIdToken } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { KitchenService } from "@/services/kitchenService";
import { LocationService } from "@/services/locationService";
import { AddressService } from "@/services/addressService";
import { Kitchen } from "@/types/kitchens";
import { Location } from "@/types/locations";
import { Delivery } from "@/types/orders";
import { parseOpeningHours, formatTimeUntilClose, OpeningHoursResult } from "@/utils/openingHoursParser";
import { track } from "@/utils/analytics";

interface UseKitchenModalOptions {
  isOpen: boolean;
}

interface UseKitchenModalReturn {
  kitchens: Kitchen[];
  selectedKitchen: Kitchen | null;
  userLocations: Location[];
  selectedLocation: Location | null;
  delivery: Delivery | null;
  isLoadingKitchens: boolean;
  isLoadingLocations: boolean;
  isLoadingDelivery: boolean;
  error: string | null;
  isAuthenticated: boolean;
  selectKitchen: (kitchenId: string) => void;
  selectLocation: (locationId: string) => void;
  refetchData: () => Promise<void>;
  formattedDeliveryPrice: string;
  favoriteLocation: Location | null;
  parsedHours: OpeningHoursResult | null;
  countdownText: string;
}

export function useKitchenModal({ isOpen }: UseKitchenModalOptions): UseKitchenModalReturn {
  const { user } = useAuth();

  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState<Kitchen | null>(null);
  const [userLocations, setUserLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);

  const [isLoadingKitchens, setIsLoadingKitchens] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingDelivery, setIsLoadingDelivery] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Tick para actualizar countdown cada minuto
  const [, setTick] = useState(0);

  const isAuthenticated = !!user;

  // Actualizar countdown cada minuto
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, [isOpen]);

  // Trackear apertura del modal
  useEffect(() => {
    if (isOpen) {
      track('kitchen_modal_opened');
    }
  }, [isOpen]);

  // Obtener token
  useEffect(() => {
    const fetchToken = async () => {
      if (user) {
        try {
          const idToken = await getIdToken(user);
          setToken(idToken);
        } catch (err) {
          console.error("Error obteniendo token:", err);
          setToken(null);
        }
      } else {
        setToken(null);
      }
    };
    fetchToken();
  }, [user]);

  const favoriteLocation = useMemo(() => {
    return userLocations.find(loc => loc.favorite) || userLocations[0] || null;
  }, [userLocations]);

  const fetchKitchens = useCallback(async () => {
    setIsLoadingKitchens(true);
    setError(null);

    try {
      const response = await KitchenService.findKitchensPublic();
      const kitchensList = response.body;

      const kitchensWithLocations = await Promise.all(
        kitchensList.map(async (kitchen) => {
          try {
            const locationResponse = await LocationService.getLocationByIdPublic(kitchen.locationId);
            return { ...kitchen, location: locationResponse.body };
          } catch {
            return kitchen;
          }
        })
      );

      setKitchens(kitchensWithLocations);

      if (kitchensWithLocations.length > 0) {
        setSelectedKitchen(kitchensWithLocations[0]);
      }
    } catch (err) {
      console.error("Error cargando cocinas:", err);
      setError("No se pudieron cargar las cocinas");
    } finally {
      setIsLoadingKitchens(false);
    }
  }, []);

  const fetchUserLocations = useCallback(async () => {
    if (!token) return;

    setIsLoadingLocations(true);

    try {
      const response = await LocationService.getUserLocations(token);
      setUserLocations([...response.body]);
    } catch (err) {
      console.error("Error cargando ubicaciones:", err);
      setUserLocations([]);
    } finally {
      setIsLoadingLocations(false);
    }
  }, [token]);

  const calculateDelivery = useCallback(async (locationId: string) => {
    setIsLoadingDelivery(true);

    try {
      const { delivery: deliveryData } = await AddressService.createDelivery(locationId);
      setDelivery(deliveryData);
    } catch (err) {
      console.error("Error calculando domicilio:", err);
      setDelivery(null);
    } finally {
      setIsLoadingDelivery(false);
    }
  }, []);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      const promises: Promise<void>[] = [fetchKitchens()];

      if (token) {
        promises.push(fetchUserLocations());
      }

      await Promise.all(promises);
    };

    loadData();
  }, [isOpen, fetchKitchens, fetchUserLocations, token]);

  // Auto-seleccionar ubicacion favorita
  useEffect(() => {
    if (userLocations.length > 0 && !selectedLocation) {
      const favorite = userLocations.find(loc => loc.favorite) || userLocations[0];
      setSelectedLocation(favorite);
    }
  }, [userLocations, selectedLocation]);

  // Calcular delivery cuando cambia ubicacion
  useEffect(() => {
    if (selectedLocation) {
      calculateDelivery(selectedLocation.id);
    } else {
      setDelivery(null);
    }
  }, [selectedLocation, calculateDelivery]);

  const selectKitchen = useCallback((kitchenId: string) => {
    const kitchen = kitchens.find(k => k.id === kitchenId);
    if (kitchen) {
      setSelectedKitchen(kitchen);
      track('kitchen_selected', { kitchen_id: kitchenId, kitchen_name: kitchen.name });
    }
  }, [kitchens]);

  const selectLocation = useCallback((locationId: string) => {
    const location = userLocations.find(l => l.id === locationId);
    if (location) {
      setSelectedLocation(location);
    }
  }, [userLocations]);

  const refetchData = useCallback(async () => {
    const promises: Promise<void>[] = [fetchKitchens()];
    if (token) {
      promises.push(fetchUserLocations());
    }
    await Promise.all(promises);
  }, [fetchKitchens, fetchUserLocations, token]);

  const formattedDeliveryPrice = useMemo(() => {
    if (!isAuthenticated) {
      return "Inicia sesión";
    }
    if (isLoadingDelivery) {
      return "Calculando...";
    }
    if (delivery) {
      return `$${delivery.price.toLocaleString("es-CO")}`;
    }
    return "Selecciona ubicación";
  }, [isAuthenticated, isLoadingDelivery, delivery]);

  const parsedHours = useMemo(() => {
    if (!selectedKitchen?.openingHours) return null;
    return parseOpeningHours(selectedKitchen.openingHours);
  }, [selectedKitchen?.openingHours]);

  const countdownText = useMemo(() => {
    if (!parsedHours?.isCurrentlyOpen || !parsedHours.timeUntilClose) return "";
    return formatTimeUntilClose(parsedHours.timeUntilClose);
  }, [parsedHours]);

  return {
    kitchens,
    selectedKitchen,
    userLocations,
    selectedLocation,
    delivery,
    isLoadingKitchens,
    isLoadingLocations,
    isLoadingDelivery,
    error,
    isAuthenticated,
    selectKitchen,
    selectLocation,
    refetchData,
    formattedDeliveryPrice,
    favoriteLocation,
    parsedHours,
    countdownText,
  };
}
