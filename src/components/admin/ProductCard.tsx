"use client";

import { Pencil, Lock } from 'lucide-react';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';

const TYPE_CONFIG = {
  product:    { label: 'Producto',     color: 'text-orange-700',  bg: 'bg-orange-100' },
  complement: { label: 'Complemento',  color: 'text-violet-700',  bg: 'bg-violet-100' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: 'Activo',     color: 'text-green-700',  bg: 'bg-green-100' },
  inactive: { label: 'Inactivo',   color: 'text-red-700',    bg: 'bg-red-100' },
};

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit }) => {
  const typeCfg = product.type ? TYPE_CONFIG[product.type] : null;
  const statusCfg = product.status ? (STATUS_CONFIG[product.status] ?? { label: product.status, color: 'text-neutral-600', bg: 'bg-neutral-100' }) : null;

  return (
    <div className="rounded-2xl border border-neutral-black-20 bg-white overflow-hidden hover:border-primary-red hover:shadow-sm transition-all group">
      {/* Thumbnail */}
      <div className="relative h-32 flex items-center justify-center" style={{ backgroundColor: product.colorPrimary + '22' }}>
        {product.photos?.[0] ? (
          <img
            src={product.photos[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black text-white"
            style={{ backgroundColor: product.colorPrimary }}
          >
            {product.name.charAt(0).toUpperCase()}
          </div>
        )}
        {product.secret && (
          <div className="absolute top-2 right-2 bg-neutral-black-80/80 text-white rounded-full p-1">
            <Lock size={11} />
          </div>
        )}
        <button
          onClick={() => onEdit(product)}
          className="absolute top-2 left-2 bg-white/90 hover:bg-white border border-neutral-black-20 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        >
          <Pencil size={12} className="text-neutral-black-80" />
        </button>
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="font-bold text-sm text-neutral-black-80 truncate group-hover:text-primary-red transition-colors">
          {product.name}
        </p>
        <p className="text-base font-black text-primary-red mt-0.5">
          ${product.price.toLocaleString('es-CO')}
        </p>
        {product.category && (
          <p className="text-xs text-neutral-black-50 mt-0.5 truncate">{product.category}</p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mt-2">
          {typeCfg && (
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', typeCfg.bg, typeCfg.color)}>
              {typeCfg.label}
            </span>
          )}
          {statusCfg && (
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', statusCfg.bg, statusCfg.color)}>
              {statusCfg.label}
            </span>
          )}
        </div>

        {/* Color swatches */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: product.colorPrimary }} title="Color primario" />
          <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: product.colorSecondary }} title="Color secundario" />
        </div>
      </div>
    </div>
  );
};
