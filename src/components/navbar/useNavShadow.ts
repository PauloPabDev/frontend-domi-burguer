"use client";

import { useEffect, useState } from 'react';
import { ConnectionStatus } from '@/types/courier';

const GLOW_GREEN  = '0 0 24px 6px rgba(34,197,94,0.45)';
const GLOW_ORANGE = '0 0 24px 6px rgba(249,115,22,0.50)';
const GLOW_RED    = '0 0 24px 6px rgba(239,68,68,0.45)';

export function useNavShadow(connectionStatus: ConnectionStatus): string | undefined {
  const [navShadow, setNavShadow] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (connectionStatus === 'CONNECTED') {
      setNavShadow(GLOW_GREEN);
      const t = setTimeout(() => setNavShadow(undefined), 2500);
      return () => clearTimeout(t);
    }
    if (connectionStatus === 'RECONNECTING') {
      setNavShadow(GLOW_ORANGE);
      return;
    }
    setNavShadow(GLOW_RED);
  }, [connectionStatus]);

  return navShadow;
}
