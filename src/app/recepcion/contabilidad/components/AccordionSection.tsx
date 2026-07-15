"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionSectionProps {
  title: string;
  icon: React.ElementType;
  badge?: string | number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionSection({ title, icon: Icon, badge, children, defaultOpen = false }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-neutral-black-20 bg-white overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-neutral-black-3 transition-colors"
      >
        <Icon size={16} className="text-neutral-black-50 shrink-0" />
        <span className="font-semibold text-sm text-neutral-black-80 flex-1">{title}</span>
        {badge !== undefined && (
          <span className="text-xs font-bold bg-neutral-black-10 text-neutral-black-50 rounded-full px-2 py-0.5">
            {badge}
          </span>
        )}
        {open
          ? <ChevronUp size={16} className="text-neutral-black-50 shrink-0" />
          : <ChevronDown size={16} className="text-neutral-black-50 shrink-0" />}
      </button>
      {open && <div className="border-t border-neutral-black-10">{children}</div>}
    </div>
  );
}
