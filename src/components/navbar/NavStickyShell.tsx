import React from 'react';

interface NavStickyShellProps {
  children: React.ReactNode;
}

export const NavStickyShell: React.FC<NavStickyShellProps> = ({ children }) => (
  <header className="sticky top-0 z-40 bg-white border-b border-neutral-black-20 shadow-sm">
    <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
      {children}
    </div>
  </header>
);
