"use client";

import { ChevronRight, FileText } from "lucide-react";
import { DocumentSummary } from "@/types/documents";

interface DocumentListItemProps {
  document: DocumentSummary;
}

export function DocumentListItem({ document }: DocumentListItemProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-neutral-black-20 bg-white shadow-sm px-4 py-3 hover:bg-neutral-black-3 transition-colors"
      style={document.color ? { borderLeftColor: document.color, borderLeftWidth: 3 } : undefined}
    >
      <span className="text-xl w-8 h-8 flex items-center justify-center shrink-0">
        {document.icon ?? <FileText size={18} className="text-neutral-black-50" />}
      </span>
      <p className="flex-1 min-w-0 text-sm font-semibold text-neutral-black-80 line-clamp-1">
        {document.title || "Sin título"}
      </p>
      <ChevronRight size={16} className="text-neutral-black-50 shrink-0" />
    </div>
  );
}
