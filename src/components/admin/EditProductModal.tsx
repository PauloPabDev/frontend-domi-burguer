"use client";

import { useState } from 'react';
import { X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';

const DEFAULTS = {
  name: '',
  price: 0,
  description: '',
  status: '',
  type: '',
  secret: false,
  colorPrimary: '#E73533',
  colorSecondary: '#FF6B6B',
};

interface EditProductModalProps {
  product?: Product;
  onSave: (id: string | null, data: Omit<Product, 'id'> | Partial<Omit<Product, 'id'>>) => Promise<void>;
  onClose: () => void;
}

const FIELD_CLASS = "w-full px-3 py-2 text-sm rounded-xl border border-neutral-black-20 focus:outline-none focus:border-primary-red transition-colors bg-white";
const LABEL_CLASS = "block text-xs font-semibold text-neutral-black-50 mb-1";

export const EditProductModal: React.FC<EditProductModalProps> = ({ product, onSave, onClose }) => {
  const isCreating = !product;

  const [form, setForm] = useState({
    name: product?.name ?? DEFAULTS.name,
    price: product?.price ?? DEFAULTS.price,
    description: product?.description ?? DEFAULTS.description,
    status: product?.status ?? DEFAULTS.status,
    type: product?.type ?? DEFAULTS.type,
    secret: product?.secret ?? DEFAULTS.secret,
    colorPrimary: product?.colorPrimary ?? DEFAULTS.colorPrimary,
    colorSecondary: product?.colorSecondary ?? DEFAULTS.colorSecondary,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('El nombre es requerido'); return; }
    if (form.price <= 0) { setError('El precio debe ser mayor a 0'); return; }
    setLoading(true);
    setError(null);

    const full = {
      name: form.name.trim(),
      price: form.price,
      description: form.description || undefined,
      status: form.status || undefined,
      type: (form.type as 'product' | 'complement') || undefined,
      secret: form.secret,
      colorPrimary: form.colorPrimary,
      colorSecondary: form.colorSecondary,
    };

    const payload = isCreating
      ? full
      : (Object.fromEntries(
          Object.entries(full).filter(([k, v]) => v !== (product as unknown as Record<string, unknown>)[k])
        ) as Partial<Omit<Product, 'id'>>);

    try {
      await onSave(product?.id ?? null, payload);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-black-10 shrink-0">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-primary-red" />
            <h3 className="font-bold text-sm text-neutral-black-80">
              {isCreating ? 'Nuevo producto' : 'Editar producto'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-black-50 hover:text-neutral-black-80">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Nombre */}
          <div>
            <label className={LABEL_CLASS}>Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className={FIELD_CLASS}
              placeholder="Nombre del producto"
            />
          </div>

          {/* Precio */}
          <div>
            <label className={LABEL_CLASS}>Precio</label>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={e => set('price', Number(e.target.value))}
              className={FIELD_CLASS}
              placeholder="0"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className={LABEL_CLASS}>Descripción</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className={`${FIELD_CLASS} resize-none h-20`}
              placeholder="Descripción del producto..."
            />
          </div>

          {/* Tipo y Estado en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Tipo</label>
              <select
                value={form.type}
                onChange={e => set('type', e.target.value)}
                className={FIELD_CLASS}
              >
                <option value="">Sin tipo</option>
                <option value="product">Producto</option>
                <option value="complement">Complemento</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Estado</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className={FIELD_CLASS}
              >
                <option value="">Sin estado</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Colores */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Color primario</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.colorPrimary}
                  onChange={e => set('colorPrimary', e.target.value)}
                  className="w-10 h-10 rounded-xl border border-neutral-black-20 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={form.colorPrimary}
                  onChange={e => set('colorPrimary', e.target.value)}
                  className={`${FIELD_CLASS} font-mono text-xs`}
                  placeholder="#000000"
                />
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS}>Color secundario</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.colorSecondary}
                  onChange={e => set('colorSecondary', e.target.value)}
                  className="w-10 h-10 rounded-xl border border-neutral-black-20 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={form.colorSecondary}
                  onChange={e => set('colorSecondary', e.target.value)}
                  className={`${FIELD_CLASS} font-mono text-xs`}
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          {/* Secreto */}
          <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-black-20 cursor-pointer hover:bg-neutral-black-10 transition-colors">
            <div>
              <p className="text-sm font-semibold text-neutral-black-80">Producto secreto</p>
              <p className="text-xs text-neutral-black-50">Solo visible para usuarios con acceso especial</p>
            </div>
            <input
              type="checkbox"
              checked={form.secret}
              onChange={e => set('secret', e.target.checked)}
              className="w-4 h-4 accent-red-600"
            />
          </label>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-neutral-black-10 shrink-0">
          <Button onClick={handleSave} loading={loading} loadingText="Guardando..." fullWidth variant="primary">
            {isCreating ? 'Crear producto' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};
