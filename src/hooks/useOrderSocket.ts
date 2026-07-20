"use client";

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { OrderStatus } from '@/types/orders';
import { RawSocketOrder } from '@/types/rawSocketOrder';
import { ConnectionStatus } from '@/types/courier';

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

interface OrderSocketUpdate {
  status: OrderStatus;
  removedFromActive: boolean;
}

export function useOrderSocket(orderId: string | null) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const initialized = useRef(false);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('IDLE');
  const [orderUpdate, setOrderUpdate] = useState<OrderSocketUpdate | null>(null);

  useEffect(() => {
    if (!orderId || initialized.current) return;
    initialized.current = true;

    const socketUrl = getSocketUrl();
    socketRef.current = io(`${socketUrl}/apiV2`, SOCKET_OPTIONS);
    setConnectionStatus('CONNECTING');

    const emitLogin = async () => {
      if (!socketRef.current?.connected || !user) return;
      const token = await user.getIdToken();
      socketRef.current.emit('login', { token, role: 'client', orderId });
    };

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

    socketRef.current.on('order/update', (raw: RawSocketOrder) => {
      setOrderUpdate({ status: raw.status, removedFromActive: false });
    });

    socketRef.current.on('order/remove', (raw: RawSocketOrder) => {
      setOrderUpdate({ status: raw.status, removedFromActive: true });
    });

    socketRef.current.on('order/delete', (raw: RawSocketOrder) => {
      setOrderUpdate({ status: raw.status, removedFromActive: true });
    });

    return () => {
      socketRef.current?.removeAllListeners();
      socketRef.current?.io?.removeAllListeners();
      socketRef.current?.disconnect();
      socketRef.current = null;
      initialized.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (connectionStatus === 'CONNECTED' && socketRef.current?.connected && user) {
      user.getIdToken().then((token) => {
        socketRef.current?.emit('login', { token, role: 'client', orderId });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { connectionStatus, orderUpdate };
}
