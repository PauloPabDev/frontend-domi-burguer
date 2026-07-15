import React from 'react';
import { cn } from '@/lib/utils';

interface NavPillShellProps {
  navShadow?: string;
  children: React.ReactNode;
  innerClassName?: string;
}

export const NavPillShell: React.FC<NavPillShellProps> = ({ navShadow, children, innerClassName }) => (
  <nav className="fixed top-0 left-0 z-40 w-full px-4">
    <div
      style={{ boxShadow: navShadow, transition: 'box-shadow 0.8s ease-in-out' }}
      className={cn(
        'max-w-[828px] md:h-[80px] h-[62px] mt-[20px] mb-[10px] rounded-[60px] border border-neutral-black-20 flex items-center justify-between w-full mx-auto px-4 sm:px-6 bg-white',
        innerClassName,
      )}
    >
      {children}
    </div>
  </nav>
);
