"use client";

import { useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ClientService, ApiClient } from '@/services/clientService';
import { UserService } from '@/services/userService';
import { LocationService } from '@/services/locationService';
import { WorkerOrderService } from '@/services/workerOrderService';
import { Location } from '@/types/locations';
import { UserProfile } from '@/types/user';
import { WorkerOrder } from '@/types/worker';

const ORDERS_LIMIT = 15;

export type PersonaStatus = 'idle' | 'loading' | 'found' | 'not_found';

export interface PersonaState<T> {
  data: T | null;
  status: PersonaStatus;
  locations: Location[];
  locationsLoading: boolean;
  orders: WorkerOrder[];
  ordersLoading: boolean;
}

function emptyPersonaState<T>(): PersonaState<T> {
  return {
    data: null,
    status: 'idle',
    locations: [],
    locationsLoading: false,
    orders: [],
    ordersLoading: false,
  };
}

export function useClientePanel() {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [clientState, setClientState] = useState<PersonaState<ApiClient>>(emptyPersonaState);
  const [userState, setUserState] = useState<PersonaState<UserProfile>>(emptyPersonaState);

  const loadClientExtras = useCallback(async (clientId: string, token: string) => {
    setClientState((s) => ({ ...s, locationsLoading: true, ordersLoading: true }));
    const [locationsResult, ordersResult] = await Promise.allSettled([
      LocationService.getByClientId(clientId, token),
      WorkerOrderService.getOrdersByClientId(token, clientId, { limit: ORDERS_LIMIT }),
    ]);
    setClientState((s) => ({
      ...s,
      locations: locationsResult.status === 'fulfilled' ? locationsResult.value.body ?? [] : [],
      locationsLoading: false,
      orders: ordersResult.status === 'fulfilled' ? ordersResult.value.body ?? [] : [],
      ordersLoading: false,
    }));
  }, []);

  const loadUserExtras = useCallback(async (userId: string, token: string) => {
    setUserState((s) => ({ ...s, locationsLoading: true, ordersLoading: true }));
    const [locationsResult, ordersResult] = await Promise.allSettled([
      LocationService.getByUserId(userId, token),
      WorkerOrderService.getOrdersByUserId(token, userId, { limit: ORDERS_LIMIT }),
    ]);
    setUserState((s) => ({
      ...s,
      locations: locationsResult.status === 'fulfilled' ? locationsResult.value.body ?? [] : [],
      locationsLoading: false,
      orders: ordersResult.status === 'fulfilled' ? ordersResult.value.body ?? [] : [],
      ordersLoading: false,
    }));
  }, []);

  const search = useCallback(async (searchPhone: string) => {
    if (!user || !searchPhone) return;
    setPhone(searchPhone);
    setClientState({ ...emptyPersonaState(), status: 'loading' });
    setUserState({ ...emptyPersonaState(), status: 'loading' });

    const token = await user.getIdToken();

    const [clientResult, userResult] = await Promise.allSettled([
      ClientService.findByPhone(searchPhone, token),
      UserService.findByPhone(searchPhone, token),
    ]);

    const client = clientResult.status === 'fulfilled' ? clientResult.value.body : null;
    if (client) {
      setClientState((s) => ({ ...s, data: client, status: 'found' }));
      loadClientExtras(client.id, token);
    } else {
      setClientState((s) => ({ ...s, status: 'not_found' }));
    }

    const foundUser = userResult.status === 'fulfilled' ? userResult.value.body : null;
    if (foundUser) {
      setUserState((s) => ({ ...s, data: foundUser, status: 'found' }));
      loadUserExtras(foundUser.id, token);
    } else {
      setUserState((s) => ({ ...s, status: 'not_found' }));
    }
  }, [user, loadClientExtras, loadUserExtras]);

  const addUserPoints = useCallback((points: number) => {
    setUserState((s) =>
      s.data ? { ...s, data: { ...s.data, pointsBalance: (s.data.pointsBalance ?? 0) + points } } : s
    );
  }, []);

  const reset = useCallback(() => {
    setPhone('');
    setClientState(emptyPersonaState());
    setUserState(emptyPersonaState());
  }, []);

  return { phone, search, reset, addUserPoints, clientState, userState };
}
