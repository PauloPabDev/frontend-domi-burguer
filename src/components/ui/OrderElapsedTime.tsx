"use client";

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { OrderStatus } from '@/types/orders';
import { cn } from '@/lib/utils';

// Estados en los que el tiempo transcurrido sigue siendo relevante
const TIMED_STATUSES: OrderStatus[] = ['fresh', 'preparing', 'ready_for_pickup', 'dispatched'];

// Umbrales (minutos) para colorear el tiempo transcurrido
const ELAPSED_WARN_MIN = 20;
const ELAPSED_LATE_MIN = 35;

function useElapsedMinutes(createdAt: string, active: boolean) {
  const getMinutes = () => Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000));
  const [minutes, setMinutes] = useState(getMinutes);

  useEffect(() => {
    if (!active) return;
    setMinutes(getMinutes());
    const id = setInterval(() => setMinutes(getMinutes()), 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdAt, active]);

  return minutes;
}

interface OrderElapsedTimeProps {
  createdAt: string;
  status: OrderStatus;
  className?: string;
}

/** Minutos desde que se creó la orden; ámbar a los 20 min y rojo a los 35. Oculto en estados finales. */
export function OrderElapsedTime({ createdAt, status, className }: OrderElapsedTimeProps) {
  const active = TIMED_STATUSES.includes(status);
  const elapsed = useElapsedMinutes(createdAt, active);

  if (!active) return null;

  return (
    <span
      className={cn(
        'flex items-center gap-0.5 font-bold',
        elapsed >= ELAPSED_LATE_MIN
          ? 'text-primary-red'
          : elapsed >= ELAPSED_WARN_MIN
            ? 'text-amber-600'
            : 'text-neutral-black-100',
        className,
      )}
    >
      <Clock size={10} />
      {elapsed}m
    </span>
  );
}
