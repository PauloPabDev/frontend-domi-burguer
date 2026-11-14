import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Complement } from "@/types/products";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Normaliza texto para comparaciones/búsquedas insensibles a mayúsculas y acentos. */
export const normalize = (s?: string) =>
  (s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// Cada línea del carrito es independiente: el id es único por línea (no se agrupan por producto/adiciones).
export const generateCartItemId = (productId: number): string =>
  `product-${productId}-${crypto.randomUUID()}`;

export const calculateTotalPrice = (
  basePrice: number,
  complements: Complement[]
): number => {
  let total = basePrice;

  complements.forEach((complement) => {
    if (complement.price && complement.price > 0) {
      total += complement.price * complement.quantity;
    }
  });

  return total;
};