"use client";

import { use } from "react";
import { DocumentDetailPage } from "@/components/documents/DocumentDetailPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DocumentoDetailPage({ params }: PageProps) {
  const { id } = use(params);
  return <DocumentDetailPage basePath="/admin/documentos" documentId={id} />;
}
