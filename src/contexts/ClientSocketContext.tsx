"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ConnectionStatus } from '@/types/courier';
import { useAuth } from '@/contexts/AuthContext';
import { getSocketUrl, SOCKET_OPTIONS } from '@/utils/socketConfig';

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
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('IDLE');

  const emitLogin = useCallback(async () => {
    if (!socketRef.current?.connected || !user) return;
    const token = await user.getIdToken();
    socketRef.current.emit('login', { token, role: 'client' });
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

    return () => {
      instance.removeAllListeners();
      instance.io.removeAllListeners();
      instance.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <ClientSocketContext.Provider value={{ socket, connectionStatus }}>
      {children}
    </ClientSocketContext.Provider>
  );
};
