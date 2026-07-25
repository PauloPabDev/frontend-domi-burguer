"use client";

import { useEffect } from 'react';

interface ChatwootAppContextMessage {
  event: 'appContext';
  data?: {
    contact?: {
      phone_number?: string;
      name?: string;
      email?: string;
    };
  };
}

function parseAppContext(raw: unknown): ChatwootAppContextMessage | null {
  if (typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.event === 'appContext' ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Escucha el "appContext" que Chatwoot envía a los Dashboard Apps embebidos por
 * iframe (ver DashboardApp/Frame.vue del core de Chatwoot): el mensaje es un
 * string JSON con forma { event: 'appContext', data: { contact, conversation, currentAgent } }.
 * Chatwoot lo publica una sola vez, justo cuando el iframe termina de cargar, así que
 * si este hook se monta después de ese instante (como ocurre con una SPA) hay que
 * volver a pedirlo explícitamente con el mensaje 'chatwoot-dashboard-app:fetch-info'.
 */
export function useChatwootBus(onPhone: (phone: string) => void) {
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = parseAppContext(event.data);
      const phone = message?.data?.contact?.phone_number;
      if (phone) onPhone(phone);
    };
    window.addEventListener('message', handler);

    if (window.self !== window.top) {
      window.parent.postMessage('chatwoot-dashboard-app:fetch-info', '*');
    }

    return () => window.removeEventListener('message', handler);
  }, [onPhone]);
}
