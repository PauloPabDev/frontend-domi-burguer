"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionCard({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("border border-gray-200 rounded-2xl", className)}>
            {children}
        </div>
    );
}

export function SectionLabel({ icon, children, className }: { icon?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {icon}
            <p className="text-xs text-neutral-400 uppercase font-bold tracking-wide">{children}</p>
        </div>
    );
}
