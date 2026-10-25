"use client";

import Link from "next/link";
import { ChevronRight, Megaphone } from "lucide-react";

export function AnnouncementsSection() {
    return (
        <div className="mb-8">
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wide mb-4">
                AVISOS
            </h2>
            <Link
                href="/avisos"
                className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <Megaphone className="w-5 h-5 text-neutral-500 shrink-0" />
                    <div>
                        <p className="font-medium text-neutral-800">Avisos y novedades</p>
                        <p className="text-xs text-neutral-500">Vuelve a ver los avisos y promociones vigentes</p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 shrink-0" />
            </Link>
        </div>
    );
}
