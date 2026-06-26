"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { CourierOrder, ConnectionStatus } from '@/types/courier';
import { useAuth } from '@/contexts/AuthContext';

interface SocketContextType {
  orders: CourierOrder[];
  connectionStatus: ConnectionStatus;
  reconnect: () => void;
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

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const initialized = useRef(false);

  const [orders, setOrders] = useState<CourierOrder[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('IDLE');

  const sortOrders = useCallback((list: CourierOrder[]) => {
    return [...list].sort((a, b) => a.dailyOrderNumber - b.dailyOrderNumber);
  }, []);

  const emitLogin = useCallback(async () => {
    if (!socketRef.current?.connected || !user) return;
    const token = await user.getIdToken();
    socketRef.current.emit('login', { token, role: 'courier', kitchenId: null });
  }, [user]);

  const reconnect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    }
  }, []);

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

    socketRef.current.on('order/init', (incoming: CourierOrder[]) => {
      setOrders(sortOrders(incoming));
    });

    socketRef.current.on('order/create', (order: CourierOrder) => {
      setOrders((prev) => {
        const map = new Map(prev.map((o) => [o.id, o]));
        map.set(order.id, order);
        return sortOrders(Array.from(map.values()));
      });
    });

    socketRef.current.on('order/update', (order: CourierOrder) => {
      setOrders((prev) => {
        const map = new Map(prev.map((o) => [o.id, o]));
        map.set(order.id, order);
        return sortOrders(Array.from(map.values()));
      });
    });

    socketRef.current.on('order/remove', (order: CourierOrder) => {
      setOrders((prev) => {
        const map = new Map(prev.map((o) => [o.id, o]));
        map.delete(order.id);
        return sortOrders(Array.from(map.values()));
      });
    });

    socketRef.current.on('order/delete', (order: CourierOrder) => {
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
    <SocketContext.Provider value={{ orders, connectionStatus, reconnect }}>
      {children}
    </SocketContext.Provider>
  );
};
