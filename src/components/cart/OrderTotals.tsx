"use client";

import { Separator } from "@/components/ui/separator";
import { Code } from "@/types/codes";
import { CartItem } from "@/store/cartStore";
import { Complement } from "@/types/products";

// Utilidad para formatear moneda de manera consistente entre servidor y cliente
const formatCurrency = (value: number): string => {
  if (isNaN(value)) return "0";
  // Usar formateo manual para evitar diferencias de locale entre servidor/cliente
  if (value === 0) return "0";
  return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Componente para mostrar un complemento/adición
const ComplementItem = ({ complement }: { complement: Complement }) => (
  <div className="flex items-center justify-between text-xs text-neutral-black-60">
    <span>
      + {complement.name} {complement.quantity && complement.quantity > 1 ? `x${complement.quantity}` : ""}
    </span>
    <span suppressHydrationWarning>
      {complement.price === 0 || complement.price == null
        ? 'GRATIS'
        : formatCurrency(complement.price * (complement.quantity || 1))}
    </span>
  </div>
);

// Componente para mostrar un producto con sus complementos
const ProductItem = ({ item }: { item: CartItem }) => (
  <div className="flex flex-col gap-1 w-full">
    <div className="flex items-center justify-between w-full">
      <p className="body-font text-neutral-black-80">
        {item.name} <span className="text-neutral-black-60">x{item.quantity}</span>
      </p>
      <p className="body-font font-medium" suppressHydrationWarning>
        {formatCurrency(item.price * item.quantity)}
      </p>
    </div>

    {item.complements.length > 0 && (
      <div className="flex flex-col gap-1 pl-3 border-l-2 border-neutral-black-20 ml-1">
        {item.complements.map((comp) => (
          <ComplementItem key={comp.id} complement={comp} />
        ))}
      </div>
    )}
  </div>
);

// Componente para una fila de resumen (subtotal, envío, descuento)
const SummaryRow = ({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: number;
  variant?: "default" | "discount" | "bold";
}) => {
  const textColor = variant === "discount" ? "text-green-600" : "";
  const fontWeight = variant === "bold" ? "font-bold" : "";

  return (
    <div className="flex items-center justify-between w-full">
      <p className={`flex-1 body-font ${textColor}`}>{label}</p>
      <p className={`w-fit body-font ${textColor} ${fontWeight}`} suppressHydrationWarning>
        {variant === "discount" ? "-" : ""}{formatCurrency(value)}
      </p>
    </div>
  );
};

// Componente para el total
const TotalRow = ({ total }: { total: number }) => (
  <div className="flex items-center justify-between w-full">
    <p className="flex-1 body-font font-bold">Total</p>
    <h2 className="w-fit" suppressHydrationWarning>{formatCurrency(total)}</h2>
  </div>
);

// Props del componente principal
interface OrderTotalsProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: CartItem[];
  appliedCoupon?: Code | null;
  discount?: number;
}

// Componente principal
export const OrderTotals = ({
  subtotal,
  deliveryFee,
  items,
  total,
  appliedCoupon,
  discount = 0,
}: OrderTotalsProps) => {
  return (
    <div className="flex flex-col items-start gap-6 w-full rounded-xl">
      {/* Resumen de productos */}
      <div className="flex flex-col gap-3 w-full">
        {items.map((item) => (
          <ProductItem key={item.id} item={item} />
        ))}
      </div>

      <Separator orientation="horizontal" />

      {/* Resumen de costos */}
      <div className="flex flex-col gap-3 w-full">
        <SummaryRow label="Subtotal" value={subtotal} />

        {appliedCoupon && discount > 0 && (
          <SummaryRow
            label={`Descuento (${appliedCoupon.code})`}
            value={discount}
            variant="discount"
          />
        )}

        <SummaryRow label="Envío" value={deliveryFee} variant="bold" />
      </div>

      <Separator orientation="horizontal" />

      <TotalRow total={total} />
    </div>
  );
};
