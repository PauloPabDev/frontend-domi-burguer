"use client";

import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuantitySelector } from '@/components/ui/quantitySelector';
import { Product } from '@/types/products';
import { OrderItem } from '@/hooks/recepcion/useNuevaOrden';

interface ProductoSelectorProps {
  allProducts: Product[];
  orderItems: OrderItem[];
  onAdd: (product: Product) => void;
  onChangeQuantity: (productId: number, quantity: number) => void;
  onEditComplements: (item: OrderItem) => void;
}

export function ProductoSelector({
  allProducts,
  orderItems,
  onAdd,
  onChangeQuantity,
  onEditComplements,
}: ProductoSelectorProps) {
  const getOrderItem = (productId: number) =>
    orderItems.find((i) => i.product.id === productId) ?? null;

  const subtotal = orderItems.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );
  const totalItems = orderItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-bold text-sm text-neutral-black-80">Productos</h3>

      <div className="flex flex-col gap-2">
        {allProducts.map((product) => {
          const item = getOrderItem(product.id);
          return (
            <div
              key={product.id}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-neutral-black-20 bg-white"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-black-80 truncate">{product.name}</p>
                <p className="text-xs text-neutral-black-50">${product.price.toLocaleString('es-CO')}</p>
                {item && item.complements.length > 0 && (
                  <p className="text-[10px] text-neutral-black-40 truncate">
                    {item.complements.filter((c) => !c.minusComplement).map((c) => c.name).filter(Boolean).join(', ')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item ? (
                  <>
                    {product.allowCustomization && (
                      <button
                        type="button"
                        onClick={() => onEditComplements(item)}
                        className="p-1 rounded text-neutral-black-40 hover:text-primary-red hover:bg-primary-red/10 transition-colors"
                        title="Editar complementos"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <QuantitySelector
                      value={item.quantity}
                      onIncrease={() => onChangeQuantity(product.id, item.quantity + 1)}
                      onDecrease={() => onChangeQuantity(product.id, item.quantity - 1)}
                      size="sm"
                    />
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onAdd(product)}
                    className="h-7 px-3 text-xs"
                  >
                    Agregar
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalItems > 0 && (
        <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-neutral-black-10 text-xs font-semibold text-neutral-black-80">
          <span>{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</span>
          <span>Subtotal: ${subtotal.toLocaleString('es-CO')}</span>
        </div>
      )}
    </div>
  );
}
