"use client";

import { Plus, Settings2 } from 'lucide-react';
import { QuantitySelector } from '@/components/ui/quantitySelector';
import { Product } from '@/types/products';
import { OrderItem } from '@/hooks/recepcion/useNuevaOrden';

interface ProductoSelectorProps {
  allProducts: Product[];
  orderItems: OrderItem[];
  onAdd: (product: Product) => void;
  onChangeQuantity: (itemId: number, quantity: number) => void;
  onEditComplements: (item: OrderItem) => void;
}

export function ProductoSelector({
  allProducts,
  orderItems,
  onAdd,
  onChangeQuantity,
  onEditComplements,
}: ProductoSelectorProps) {
  const totalUnidades = orderItems.reduce((s, i) => s + i.quantity, 0);
  const subtotal = orderItems.reduce((s, i) => s + i.product.price * i.quantity, 0);

  // Number of times each product appears in the order
  const countByProduct = (productId: number) =>
    orderItems.filter((i) => i.product.id === productId).reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-bold text-sm text-neutral-black-80">Productos</h3>

      {/* ── Catálogo: grid en tablet+, columna en móvil ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {allProducts.map((product) => {
          const inOrder = countByProduct(product.id);
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => onAdd(product)}
              className="group flex items-center gap-3 p-3 rounded-xl border border-neutral-black-20 bg-neutral-black-5 hover:border-primary-red/40 hover:bg-primary-red/5 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-black-80 leading-snug">
                  {product.name}
                </p>
                <p className="text-xs text-neutral-black-50 mt-0.5">
                  ${product.price.toLocaleString('es-CO')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {inOrder > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary-red text-white text-[10px] font-bold flex items-center justify-center">
                    {inOrder}
                  </span>
                )}
                <div className="w-7 h-7 rounded-lg border border-neutral-black-20 group-hover:border-primary-red group-hover:bg-primary-red group-hover:text-white flex items-center justify-center transition-colors text-neutral-black-50">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Items en la orden ── */}
      {orderItems.length > 0 && (
        <div className="flex flex-col gap-3 pt-4 border-t border-neutral-black-20">
          <p className="text-[11px] font-bold text-neutral-black-40 uppercase tracking-widest">
            En la orden
          </p>

          <div className="flex flex-col gap-2">
            {orderItems.map((item) => {
              const additions = item.complements.filter((c) => !c.minusComplement && c.name);
              const removals = item.complements.filter((c) => c.minusComplement && c.name);
              const hasCustom = additions.length > 0 || removals.length > 0;

              return (
                <div
                  key={item.itemId}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-primary-red/20 bg-primary-red/5"
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-black-80 truncate">
                        {item.product.name}
                      </p>
                      {hasCustom && (
                        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-primary-red bg-primary-red/10 px-1.5 py-0.5 rounded-full">
                          custom
                        </span>
                      )}
                    </div>
                    {additions.length > 0 && (
                      <p className="text-xs text-green-600 truncate mt-0.5">
                        + {additions.map((c) => c.name).join(', ')}
                      </p>
                    )}
                    {removals.length > 0 && (
                      <p className="text-xs text-neutral-black-40 line-through truncate">
                        {removals.map((c) => c.name).join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <span className="text-sm font-semibold text-neutral-black-70 shrink-0">
                    ${(item.product.price * item.quantity).toLocaleString('es-CO')}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.product.allowCustomization && (
                      <button
                        type="button"
                        onClick={() => onEditComplements(item)}
                        className="p-1.5 rounded-lg text-neutral-black-40 hover:text-primary-red hover:bg-primary-red/10 transition-colors"
                        title="Personalizar"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <QuantitySelector
                      value={item.quantity}
                      onIncrease={() => onChangeQuantity(item.itemId, item.quantity + 1)}
                      onDecrease={() => onChangeQuantity(item.itemId, item.quantity - 1)}
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mini subtotal */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-black-10 text-xs font-semibold text-neutral-black-80">
            <span>{totalUnidades} {totalUnidades === 1 ? 'unidad' : 'unidades'}</span>
            <span>${subtotal.toLocaleString('es-CO')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
