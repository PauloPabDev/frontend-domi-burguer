export interface DocumentSummary {
  id: string;
  title: string;
  icon: string | null;
  color: string | null;
  updatedAt: string;
  revision: number;
}

export interface DocumentSection {
  id: string;
  title: string;
  documents: DocumentSummary[];
}

export interface DocumentDetail {
  id: string;
  title: string;
  icon: string | null;
  color: string | null;
  breadcrumb: string | null;
  collectionId: string;
  parentDocumentId: string | null;
  createdAt: string;
  updatedAt: string;
  revision: number;
  text: string;
}
