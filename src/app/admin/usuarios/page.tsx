"use client";

import { useState } from 'react';
import { Search, Loader2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUsers } from '@/hooks/admin/useUsers';
import { UserCard } from '@/components/admin/UserCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ROLES = [
  { value: '', label: 'Todos' },
  { value: 'admin', label: 'Admin' },
  { value: 'reception', label: 'Recepción' },
  { value: 'cook', label: 'Cocina' },
  { value: 'courier', label: 'Domicilio' },
  { value: 'customer', label: 'Cliente' },
];

export default function AdminUsuariosPage() {
  const { users, loading, error, search, role, setFilters, page, setPage, total, totalPages, hasNextPage, hasPrevPage, refetch } = useUsers();
  const [inputValue, setInputValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const v = inputValue.trim();
    setFilters(v, '');
  };

  const handleRoleSelect = (r: string) => {
    setInputValue('');
    setFilters('', r);
  };

  const handleClear = () => {
    setInputValue('');
    setFilters('', '');
  };

  const hasFilter = !!search || !!role;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-baseline gap-2">
          <h1 className="text-lg font-bold text-neutral-black-80">Usuarios</h1>
          {total > 0 && (
            <span className="text-xs text-neutral-black-40">{total} total</span>
          )}
        </div>
        <button
          onClick={refetch}
          className="p-1.5 rounded-full text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10 transition-colors"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Role filter */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {ROLES.map((r) => (
          <button
            key={r.value}
            onClick={() => handleRoleSelect(r.value)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              role === r.value
                ? 'bg-primary-red text-white'
                : 'bg-neutral-black-10 text-neutral-black-50 hover:bg-neutral-black-20 hover:text-neutral-black-80'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Search by email */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-black-50" />
          <input
            type="email"
            placeholder="Buscar por email..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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
          <p className="text-sm">Cargando usuarios...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-red-500">{error}</p>
          <Button variant="outline" size="sm" onClick={refetch} leftIcon={<RefreshCw size={14} />}>
            Reintentar
          </Button>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-neutral-black-50">
          <p className="text-sm">
            No se encontraron usuarios
            {search ? ` para "${search}"` : role ? ` con rol "${ROLES.find(r => r.value === role)?.label}"` : ''}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>

          {/* Pagination */}
          {(hasPrevPage || hasNextPage) && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!hasPrevPage}
                className="p-1.5 rounded-full text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-neutral-black-50">
                Página <span className="font-semibold text-neutral-black-80">{page}</span>
                {totalPages && (
                  <> de <span className="font-semibold text-neutral-black-80">{totalPages}</span></>
                )}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!hasNextPage}
                className="p-1.5 rounded-full text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
