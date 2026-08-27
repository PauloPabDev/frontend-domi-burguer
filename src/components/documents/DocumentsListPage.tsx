"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, RefreshCw, Search, X } from "lucide-react";
import { useDocumentsList } from "@/hooks/documents/useDocumentsList";
import { DocumentListItem } from "./DocumentListItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DocumentsListPageProps {
  /** Ruta base del rol, p. ej. "/recepcion/documentos" */
  basePath: string;
}

// Búsqueda insensible a mayúsculas/acentos ("politicas" matches "Políticas").
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/**
 * Página de lista compartida por los 4 roles (cocina, recepción,
 * domiciliario, admin) — el rol nunca se elige aquí, lo resuelve el backend
 * a partir del token de quien hace la petición.
 */
export function DocumentsListPage({ basePath }: DocumentsListPageProps) {
  const { sections, loading, error, refetch } = useDocumentsList();
  const [search, setSearch] = useState("");

  const filteredSections = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return sections;
    return sections
      .map((section) => ({
        ...section,
        documents: section.documents.filter((doc) => normalize(doc.title || "").includes(term)),
      }))
      .filter((section) => section.documents.length > 0);
  }, [sections, search]);

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

  const hasResults = filteredSections.some((section) => section.documents.length > 0);

  return (
    <div className="h-full overflow-y-auto py-4 pb-8">
      <div className="max-w-prose mx-auto space-y-6">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-black-50 pointer-events-none"
          />
          <Input
            type="text"
            placeholder="Buscar documento por nombre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-black-50 hover:text-neutral-black-80"
              aria-label="Limpiar búsqueda"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {!hasResults && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-black-50">
            <Search size={32} className="opacity-30" />
            <p className="text-sm">No encontramos documentos que coincidan con &quot;{search}&quot;</p>
          </div>
        )}

        {filteredSections
          .filter((section) => section.documents.length > 0)
          .map((section) => (
            <div key={section.id}>
              <h2 className="font-semibold text-sm text-neutral-black-80 mb-2 mt-2 my-2">{section.title}</h2>
              <div className="space-y-2">
                {section.documents.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`${basePath}/${doc.id}`}
                    className="block my-2"
                  >
                    <DocumentListItem document={doc} />
                  </Link>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
