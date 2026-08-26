import { useState, useEffect } from 'react';
import { DocumentSection } from '@/types/documents';
import { DocumentsService } from '@/services/documentsService';
import { useAuth } from '@/contexts/AuthContext';

export const useDocumentsList = () => {
  const { user } = useAuth();
  const [sections, setSections] = useState<DocumentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const result = await DocumentsService.getForRole(token);
      setSections(result.body?.sections ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { sections, loading, error, refetch: fetchDocuments };
};
