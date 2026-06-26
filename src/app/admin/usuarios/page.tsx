"use client";

import { useState } from 'react';
import { Search, Loader2, RefreshCw } from 'lucide-react';
import { useUsers } from '@/hooks/admin/useUsers';
import { UserCard } from '@/components/admin/UserCard';
import { Button } from '@/components/ui/button';

export default function AdminUsuariosPage() {
  const { users, loading, error, search, setSearch, refetch } = useUsers();
  const [inputValue, setInputValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(inputValue.trim());
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold text-neutral-black-80">Usuarios</h1>
        <button onClick={refetch} className="p-1.5 rounded-full text-neutral-black-50 hover:text-neutral-black-80 hover:bg-neutral-black-10 transition-colors">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Search */}
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
        {search && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setInputValue(''); setSearch(''); }}
          >
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
          <p className="text-sm">No se encontraron usuarios{search ? ` para "${search}"` : ''}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
