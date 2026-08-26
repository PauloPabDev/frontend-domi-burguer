import { useState, useEffect } from 'react';
import { DocumentDetail } from '@/types/documents';
import { DocumentsService } from '@/services/documentsService';
import { useAuth } from '@/contexts/AuthContext';

export const useDocumentDetail = (documentId: string) => {
  const { user } = useAuth();
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await user.getIdToken();
        const result = await DocumentsService.getById(token, documentId);
        setDocument(result.body);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el documento');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [user, documentId]);

  return { document, loading, error };
};
