"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavWorkerAvatarProps {
  /** Cuando no hay espacio (por debajo de lg), oculta el nombre y deja solo el avatar. */
  compact?: boolean;
}

export const NavWorkerAvatar: React.FC<NavWorkerAvatarProps> = ({ compact = false }) => {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push('/profile')}
      variant="yellow"
      size="md"
      className="rounded-full p-2 lg:h-12 lg:px-5 shrink-0"
    >
      <Avatar className="w-7 h-7 md:w-8 md:h-8">
        {user?.photoURL && (
          <AvatarImage src={user.photoURL} alt={user.displayName ?? ''} />
        )}
        <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
      </Avatar>
      <span
        className={cn(
          'text-neutral-black-80 font-label text-xs md:text-sm',
          compact && 'hidden lg:inline',
        )}
      >
        {user?.displayName?.split(' ')[0]?.toUpperCase() ?? 'PERFIL'}
      </span>
    </Button>
  );
};
