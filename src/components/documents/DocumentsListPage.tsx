"use client";

import Link from "next/link";
import { BookOpen, RefreshCw } from "lucide-react";
import { useDocumentsList } from "@/hooks/documents/useDocumentsList";
import { DocumentListItem } from "./DocumentListItem";
import { Button } from "@/components/ui/button";

interface DocumentsListPageProps {
  /** Ruta base del rol, p. ej. "/recepcion/documentos" */
  basePath: string;
}

/**
 * Página de lista compartida por los 4 roles (cocina, recepción,
 * domiciliario, admin) — el rol nunca se elige aquí, lo resuelve el backend
 * a partir del token de quien hace la petición.
 */
export function DocumentsListPage({ basePath }: DocumentsListPageProps) {
  const { sections, loading, error, refetch } = useDocumentsList();

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-neutral-black-50">
        <div className="w-8 h-8 border-4 border-primary-red border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Cargando documentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-neutral-black-50">
        <p className="text-sm text-red-500">{error}</p>
        <Button variant="outline" size="sm" onClick={refetch} leftIcon={<RefreshCw size={14} />}>
          Reintentar
        </Button>
      </div>
    );
  }

  const isEmpty = sections.every((section) => section.documents.length === 0);

  if (isEmpty) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-12 gap-3 text-neutral-black-50">
        <BookOpen size={40} className="opacity-30" />
        <p className="text-sm">Todavía no hay documentos disponibles para ti</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto py-4 space-y-6 pb-8">
      {sections
        .filter((section) => section.documents.length > 0)
        .map((section) => (
          <div key={section.id}>
            <h2 className="font-semibold text-sm text-neutral-black-80 mb-2">{section.title}</h2>
            <div className="space-y-2">
              {section.documents.map((doc) => (
                <Link key={doc.id} href={`${basePath}/${doc.id}`}>
                  <DocumentListItem document={doc} />
                </Link>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
