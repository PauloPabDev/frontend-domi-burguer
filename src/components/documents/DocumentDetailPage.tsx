"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useDocumentDetail } from "@/hooks/documents/useDocumentDetail";
import { DocumentMarkdown } from "./DocumentMarkdown";
import { Button } from "@/components/ui/button";

interface DocumentDetailPageProps {
  /** Ruta base del rol para volver a la lista, p. ej. "/cocina/documentos" */
  basePath: string;
  documentId: string;
}

export function DocumentDetailPage({ basePath, documentId }: DocumentDetailPageProps) {
  const { document, loading, error } = useDocumentDetail(documentId);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-neutral-black-50">
        <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Cargando documento...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-neutral-black-50">
        <p className="text-sm text-red-500">{error ?? "Documento no encontrado"}</p>
        <Link href={basePath}>
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Volver
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto py-4 pb-8 space-y-4">
      <div className="flex items-center gap-3">
        <Link href={basePath} className="p-2 rounded-full hover:bg-neutral-black-10 transition-colors shrink-0">
          <ArrowLeft size={18} className="text-neutral-black-80" />
        </Link>
        <h1 className="font-bold text-neutral-black-80 line-clamp-2">
          {document.icon && <span className="mr-2">{document.icon}</span>}
          {document.title || "Documento"}
        </h1>
      </div>

      <DocumentMarkdown content={document.text} className="px-1" />
    </div>
  );
}
