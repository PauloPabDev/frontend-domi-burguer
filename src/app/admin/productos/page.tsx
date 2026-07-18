"use client";

import { useState } from 'react';
import { Search, Loader2, RefreshCw, Package, Plus } from 'lucide-react';
import { useAdminProducts } from '@/hooks/admin/useAdminProducts';
import { ProductCard } from '@/components/admin/ProductCard';
import { EditProductModal } from '@/components/admin/EditProductModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Product } from '@/types/product';

const TYPE_FILTERS = [
  { value: '' as const,           label: 'Todos' },
  { value: 'product' as const,    label: 'Productos' },
  { value: 'complement' as const, label: 'Complementos' },
];

// null = modal de crear, Product = modal de editar, undefined = cerrado
type ModalState = Product | null | undefined;

export default function AdminProductosPage() {
  const {
    products, total, loading, error,
    search, setSearch,
    typeFilter, setTypeFilter,
    refetch, updateProduct, createProduct,
  } = useAdminProducts();

  const [inputValue, setInputValue] = useState('');
  const [modalState, setModalState] = useState<ModalState>(undefined);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(inputValue.trim());
  };

  const handleClear = () => {
    setInputValue('');
    setSearch('');
  };

  const handleSave = async (id: string | null, data: Omit<Product, 'id'> | Partial<Omit<Product, 'id'>>) => {
    if (id) {
      await updateProduct(id, data as Partial<Omit<Product, 'id'>>);
    } else {
      await createProduct(data as Omit<Product, 'id'>);
    }
  };

  const hasFilter = !!search || !!typeFilter;
  const modalOpen = modalState !== undefined;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-baseline gap-2">
          <h1 className="text-lg font-bold text-neutral-black-80">Productos</h1>
          {total > 0 && !loading && (
            <span className="text-xs text-neutral-black-40">{total} total</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            className="p-1.5 rounded-full text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10 transition-colors"
          >
            <RefreshCw size={15} />
          </button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setModalState(null)}
          >
            Nuevo producto
          </Button>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {TYPE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTypeFilter(value)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              typeFilter === value
                ? 'bg-primary-red text-white'
                : 'bg-neutral-black-10 text-neutral-black-50 hover:bg-neutral-black-20 hover:text-neutral-black-80'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-black-50" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-neutral-black-20 focus:outline-none focus:border-primary-red transition-colors"
          />
        </div>
        <Button type="submit" variant="primary" size="sm">Buscar</Button>
        {hasFilter && (
          <Button type="button" variant="outline" size="sm" onClick={handleClear}>
            Limpiar
          </Button>
        )}
      </form>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-black-50">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm">Cargando productos...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-red-500">{error}</p>
          <Button variant="outline" size="sm" onClick={refetch} leftIcon={<RefreshCw size={14} />}>
            Reintentar
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-black-50">
          <Package size={32} className="opacity-40" />
          <p className="text-sm">
            No se encontraron productos
            {search ? ` para "${search}"` : ''}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={(p) => setModalState(p)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {modalOpen && (
        <EditProductModal
          product={modalState ?? undefined}
          onSave={handleSave}
          onClose={() => setModalState(undefined)}
        />
      )}
    </div>
  );
}
