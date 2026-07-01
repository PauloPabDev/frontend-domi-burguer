'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { ProductService } from '@/services/productService';
import { Product } from '@/types/product';

interface ProductsContextValue {
  products: Map<string, Product>;
  loading: boolean;
}

const ProductsContext = createContext<ProductsContextValue>({
  products: new Map(),
  loading: false,
});

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [loading, setLoading] = useState(false);
  const fetchedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      // Usuario deslogeado: limpiar productos
      setProducts(new Map());
      fetchedFor.current = null;
      return;
    }

    // Evitar re-fetch si ya se cargaron para este usuario
    if (fetchedFor.current === user.uid) return;
    fetchedFor.current = user.uid;

    setLoading(true);
    user
      .getIdToken()
      .then((token) => ProductService.getAll(token))
      .then(({ body }) => {
        const map = new Map(body.map((p) => [p.id, p]));
        setProducts(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ProductsContext.Provider value={{ products, loading }}>
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => useContext(ProductsContext);
