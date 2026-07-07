"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { addToast } from '@heroui/toast';
import { ConnectionStatus } from '@/types/courier';
import { RawSocketOrder } from '@/types/rawSocketOrder';
import { WorkerOrder } from '@/types/worker';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeSocketOrder, normalizeSocketOrders } from '@/utils/normalizeSocketOrder';
import { playOrderNotification } from '@/utils/notificationSound';

interface SocketContextType {
  orders: WorkerOrder[];
  connectionStatus: ConnectionStatus;
  reconnect: () => void;
  changeKitchen: (kitchenId: string | null) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket debe usarse dentro de SocketProvider');
  }
  return context;
};

function getSocketUrl(): string {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8087/').replace(/\/$/, '');

  if (typeof window === 'undefined') return base;

  const currentHost = window.location.hostname;
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') return base;

  try {
    const url = new URL(base);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      url.hostname = currentHost;
      return url.toString().replace(/\/$/, '');
    }
  } catch {
    return base;
  }

  return base;
}

const SOCKET_OPTIONS = {
  transports: ['websocket', 'polling'] as ('websocket' | 'polling')[],
  upgrade: true,
  timeout: 5000,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
};

interface SocketProviderProps {
  children: React.ReactNode;
  role: string;
  kitchenId?: string | null;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  role,
  kitchenId: initialKitchenId = null,
}) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const initialized = useRef(false);
  const kitchenIdRef = useRef<string | null>(initialKitchenId ?? null);

  const [orders, setOrders] = useState<WorkerOrder[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('IDLE');
  const orderIdsRef = useRef<Set<string>>(new Set());

  const sortOrders = useCallback((list: WorkerOrder[]) => {
    return [...list].sort((a, b) => a.dailyOrderNumber - b.dailyOrderNumber);
  }, []);

  const emitLogin = useCallback(async (overrideKitchenId?: string | null) => {
    if (!socketRef.current?.connected || !user) return;
    const token = await user.getIdToken();
    const kId = overrideKitchenId !== undefined ? overrideKitchenId : kitchenIdRef.current;
    socketRef.current.emit('login', { token, role, kitchenId: kId });
  }, [user, role]);

  const reconnect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    }
  }, []);

  const changeKitchen = useCallback((id: string | null) => {
    kitchenIdRef.current = id;
    emitLogin(id);
  }, [emitLogin]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const socketUrl = getSocketUrl();
    socketRef.current = io(`${socketUrl}/apiV2`, SOCKET_OPTIONS);
    setConnectionStatus('CONNECTING');

    socketRef.current.on('connect', () => {
      setConnectionStatus('CONNECTED');
      emitLogin();
    });

    socketRef.current.on('disconnect', (reason) => {
      if (reason === 'io client disconnect') {
        setConnectionStatus('DISCONNECTED');
      } else {
        setConnectionStatus('RECONNECTING');
      }
    });

    socketRef.current.on('connect_error', () => {
      setConnectionStatus('DISCONNECTED');
    });

    socketRef.current.io?.on('reconnect_attempt', () => {
      setConnectionStatus('RECONNECTING');
    });

    socketRef.current.io?.on('reconnect', () => {
      setConnectionStatus('CONNECTED');
      emitLogin();
    });

    socketRef.current.on('order/init', (incoming: RawSocketOrder[]) => {
      const normalized = normalizeSocketOrders(incoming);
      orderIdsRef.current = new Set(normalized.map((o) => o.id));
      setOrders(sortOrders(normalized));
    });

    const notifyNewKitchenOrder = (order: WorkerOrder) => {
      playOrderNotification();
      const itemsSummary = order.orderItems.slice(0, 2).map((i) => i.name).join(', ');
      const extra = order.orderItems.length > 2 ? ` +${order.orderItems.length - 2} más` : '';
      addToast({
        title: `Nueva orden #${order.dailyOrderNumber}`,
        description: `${order.client?.name ?? 'Cliente'} · ${itemsSummary}${extra}`,
        color: 'warning',
        timeout: 2000,
      });
    };

    socketRef.current.on('order/create', (raw: RawSocketOrder) => {
      const order = normalizeSocketOrder(raw);
      orderIdsRef.current.add(order.id);
      setOrders((prev) => {
        const map = new Map(prev.map((o) => [o.id, o]));
        map.set(order.id, order);
        return sortOrders(Array.from(map.values()));
      });
      console.log(role, 'role')
      if (role === 'cook') {
        notifyNewKitchenOrder(order);
      }
    });

    socketRef.current.on('order/update', (raw: RawSocketOrder) => {
      const order = normalizeSocketOrder(raw);
      const isNew = !orderIdsRef.current.has(order.id);

      if (role === 'courier' && isNew) {
        addToast({
          title: 'Nueva orden asignada',
          description: order.client?.name ?? 'Cliente',
          color: 'success',
          timeout: 5000,
        });
      }

      if (role === 'cook' && isNew) {
        notifyNewKitchenOrder(order);
      }
      orderIdsRef.current.add(order.id);
      setOrders((prev) => {
        const map = new Map(prev.map((o) => [o.id, o]));
        map.set(order.id, order);
        return sortOrders(Array.from(map.values()));
      });
    });

    socketRef.current.on('order/remove', (raw: RawSocketOrder) => {
      const order = normalizeSocketOrder(raw);
      orderIdsRef.current.delete(order.id);
      setOrders((prev) => {
        const map = new Map(prev.map((o) => [o.id, o]));
        map.delete(order.id);
        return sortOrders(Array.from(map.values()));
      });
    });

    socketRef.current.on('order/delete', (raw: RawSocketOrder) => {
      const order = normalizeSocketOrder(raw);
      orderIdsRef.current.delete(order.id);
      setOrders((prev) => {
        const map = new Map(prev.map((o) => [o.id, o]));
        map.delete(order.id);
        return sortOrders(Array.from(map.values()));
      });
    });

    return () => {
      socketRef.current?.removeAllListeners();
      socketRef.current?.io?.removeAllListeners();
      socketRef.current?.disconnect();
      socketRef.current = null;
      initialized.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (connectionStatus === 'CONNECTED') {
      emitLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!navigator.onLine) {
      setConnectionStatus('OFFLINE');
    }

    const handleOffline = () => setConnectionStatus('OFFLINE');
    const handleOnline = () => {
      if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect();
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ orders, connectionStatus, reconnect, changeKitchen }}>
      {children}
    </SocketContext.Provider>
  );
};
