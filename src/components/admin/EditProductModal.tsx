"use client";

import { useState } from 'react';
import { Package } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { FIELD_CLASS } from './fieldClass';
import { Product } from '@/types/product';

const DEFAULTS = {
  id: '',
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
  onSave: (id: string | null, data: (Omit<Product, 'id'> & { id?: string }) | Partial<Omit<Product, 'id'>>) => Promise<void>;
  onClose: () => void;
}

const LABEL_CLASS = "block text-xs font-semibold text-neutral-black-50 mb-1";

export const EditProductModal: React.FC<EditProductModalProps> = ({ product, onSave, onClose }) => {
  const isCreating = !product;

  const [form, setForm] = useState({
    id: DEFAULTS.id,
    name: product?.name ?? DEFAULTS.name,
    price: product?.price ?? DEFAULTS.price,
    description: product?.description ?? DEFAULTS.description,
    status: product?.status ?? DEFAULTS.status,
    type: product?.type ?? DEFAULTS.type,
    secret: product?.secret ?? DEFAULTS.secret,
    colorPrimary: product?.colorPrimary ?? DEFAULTS.colorPrimary,
    colorSecondary: product?.colorSecondary ?? DEFAULTS.colorSecondary,
  });
  // Foto de los valores con que se abrió: el modal se monta ya abierto, así que no hay que reiniciarla
  const [initialForm] = useState(() => JSON.stringify(form));
  const dirty = JSON.stringify(form) !== initialForm;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('El nombre es requerido'); return; }
    if (form.price < 0) { setError('El precio debe ser mayor a 0'); return; }
    setLoading(true);
    setError(null);

    const full = {
      ...(isCreating && form.id.trim() ? { id: form.id.trim() } : {}),
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
    <Modal
      open
      onOpenChange={(o) => { if (!o && !loading) onClose(); }}
      size="md"
      dirty={dirty}
      title={isCreating ? 'Nuevo producto' : 'Editar producto'}
      headerIcon={<Package size={20} className="text-primary-red" />}
      footer={{
        cancel: { label: 'CANCELAR', disabled: loading },
        confirm: {
          label: isCreating ? 'CREAR PRODUCTO' : 'GUARDAR CAMBIOS',
          onClick: handleSave,
          loading,
          loadingText: 'Guardando...',
        },
      }}
    >
      <div className="space-y-4">
        {/* ID (opcional, solo al crear) */}
        {isCreating && (
          <div>
            <label className={LABEL_CLASS}>ID del producto (opcional)</label>
            <input
              type="text"
              value={form.id}
              onChange={e => set('id', e.target.value)}
              className={`${FIELD_CLASS} font-mono text-xs`}
              placeholder="Se generará automáticamente si se deja vacío"
            />
          </div>
        )}

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
    </Modal>
  );
};
