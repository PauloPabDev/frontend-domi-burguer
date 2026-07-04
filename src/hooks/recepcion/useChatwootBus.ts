"use client";

import { useEffect } from 'react';

interface ChatwootMessageEvent {
  type?: string;
  eventObject?: {
    event?: string;
    data?: {
      phone_number?: string;
    };
  };
}

export function useChatwootBus(onPhone: (phone: string) => void) {
  useEffect(() => {
    const handler = (event: MessageEvent<ChatwootMessageEvent>) => {
      if (event.data?.type !== 'chatwoot:on-event') return;
      if (event.data.eventObject?.event !== 'contact-panel-open') return;
      const phone = event.data.eventObject?.data?.phone_number;
      if (phone) onPhone(phone);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onPhone]);
}
