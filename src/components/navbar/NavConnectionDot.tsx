import { cn } from '@/lib/utils';
import { ConnectionStatus } from '@/types/courier';

const STATUS_DOT: Record<ConnectionStatus, string> = {
  CONNECTED:    'bg-green-500',
  CONNECTING:   'bg-yellow-400 animate-pulse',
  RECONNECTING: 'bg-yellow-400 animate-pulse',
  DISCONNECTED: 'bg-red-500',
  OFFLINE:      'bg-red-500',
  IDLE:         'bg-neutral-400',
};

interface NavConnectionDotProps {
  status: ConnectionStatus;
}

export const NavConnectionDot: React.FC<NavConnectionDotProps> = ({ status }) => (
  <div className={cn('w-2.5 h-2.5 rounded-full', STATUS_DOT[status])} title={status} />
);
