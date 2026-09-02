"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { addToast } from '@heroui/toast';
import { ConnectionStatus } from '@/types/courier';
import { RawSocketOrder } from '@/types/rawSocketOrder';
import { STATUS_CONFIG } from '@/types/worker';
import { useAuth } from '@/contexts/AuthContext';
import { getSocketUrl, SOCKET_OPTIONS } from '@/utils/socketConfig';
import { normalizeSocketOrders } from '@/utils/normalizeSocketOrder';

const TOAST_COLOR_BY_STATUS: Partial<Record<RawSocketOrder['status'], 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'>> = {
  fresh: 'primary',
  preparing: 'primary',
  ready_for_pickup: 'secondary',
  dispatched: 'success',
  pending_payment: 'warning',
};

interface ClientSocketContextType {
  socket: Socket | null;
  connectionStatus: ConnectionStatus;
}

const ClientSocketContext = createContext<ClientSocketContextType>({
  socket: null,
  connectionStatus: 'IDLE',
});

export const useClientSocket = () => useContext(ClientSocketContext);

export const ClientSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('IDLE');
  // Se actualiza en cada render (no en un efecto) para que emitLogin siempre
  // lea la ruta más reciente, sin depender de que un efecto ya haya corrido.
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  // Evita duplicar el primer envío de página: el login inicial ya la manda.
  const hasSkippedInitialPageEffect = useRef(false);

  const emitLogin = useCallback(async () => {
    if (!socketRef.current?.connected || !user) return;
    const token = await user.getIdToken();
    socketRef.current.emit('login', { token, role: 'client', page: pathnameRef.current });
  }, [user]);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnectionStatus('IDLE');
      return;
    }

    const socketUrl = getSocketUrl();
    const instance = io(`${socketUrl}/apiV2`, SOCKET_OPTIONS);
    socketRef.current = instance;
    setSocket(instance);
    setConnectionStatus('CONNECTING');

    instance.on('connect', () => {
      setConnectionStatus('CONNECTED');
      emitLogin();
    });

    instance.on('disconnect', (reason) => {
      setConnectionStatus(reason === 'io client disconnect' ? 'DISCONNECTED' : 'RECONNECTING');
    });

    instance.on('connect_error', () => {
      setConnectionStatus('DISCONNECTED');
    });

    instance.io.on('reconnect_attempt', () => {
      setConnectionStatus('RECONNECTING');
    });

    instance.io.on('reconnect', () => {
      setConnectionStatus('CONNECTED');
      emitLogin();
    });

    instance.on('order/init', (raws: RawSocketOrder[]) => {
      const orders = normalizeSocketOrders(raws);
      orders.forEach((order) => {
        const config = STATUS_CONFIG[order.status];
        addToast({
          title: `Pedido #${order.dailyOrderNumber}`,
          description: config?.label ?? order.status,
          color: TOAST_COLOR_BY_STATUS[order.status] ?? 'default',
          timeout: 5000,
        });
      });
    });

    return () => {
      instance.removeAllListeners();
      instance.io.removeAllListeners();
      instance.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Informa cambios de ruta posteriores al login inicial (que ya mandó la
  // página de entrada). Si el socket está desconectado en este instante no
  // pasa nada: el próximo login/reconexión ya manda la página correcta vía
  // pathnameRef.
  useEffect(() => {
    if (!hasSkippedInitialPageEffect.current) {
      hasSkippedInitialPageEffect.current = true;
      return;
    }
    if (socketRef.current?.connected) {
      socketRef.current.emit('presence/page', { page: pathname });
    }
  }, [pathname]);

  return (
    <ClientSocketContext.Provider value={{ socket, connectionStatus }}>
      {children}
    </ClientSocketContext.Provider>
  );
};
