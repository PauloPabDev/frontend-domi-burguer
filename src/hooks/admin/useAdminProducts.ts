"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types/product';
import { ProductService } from '@/services/productService';

export const useAdminProducts = () => {
  const { user } = useAuth();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'product' | 'complement' | ''>('');

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const { body } = await ProductService.getAll(token);
      setAllProducts(body ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateProduct = async (id: string, data: Partial<Omit<Product, 'id'>>) => {
    if (!user) return;
    const token = await user.getIdToken();
    const { body } = await ProductService.update(token, id, data);
    if (body) {
      setAllProducts(prev => prev.map(p => p.id === id ? body : p));
    }
    return body;
  };

  const createProduct = async (data: Omit<Product, 'id'>) => {
    if (!user) return;
    const token = await user.getIdToken();
    const { body } = await ProductService.create(token, data);
    if (body) {
      setAllProducts(prev => [body, ...prev]);
    }
    return body;
  };

  const products = allProducts.filter(p => {
    if (!p || !p.id || !p.name) return false;
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return {
    products,
    total: allProducts.length,
    loading,
    error,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    refetch: fetchProducts,
    updateProduct,
    createProduct,
  };
};
