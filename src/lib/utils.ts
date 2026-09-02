import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Complement } from "@/types/products";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Normaliza texto para comparaciones/búsquedas insensibles a mayúsculas y acentos. */
export const normalize = (s?: string) =>
  (s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export const generateCartItemId = (
  productId: number,
  complements: Complement[]
): string => {
  if (complements.length === 0) {
    return `product-${productId}`;
  }

  // Crear un string único ordenando complementos por ID
  const complementsSignature = complements
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    .map((c) => `${c.id}:${c.quantity}`)
    .join("|");

  return `product-${productId}-complements-${complementsSignature}`;
};

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