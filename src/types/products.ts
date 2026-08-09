import { LogoProps } from "@/components/ui/icons";

export interface Complement {
  id: number | string;
  name?: string;
  quantity: number;
  icon?: string;
  price?: number | null;
  type?: "removable" | "special" | "addable";
  additionId?: number;
  minusId?: number;
  minusComplement: boolean;
  rewardCode?: string; // Para complementar con rewards de códigos
  colorPrimary?: string; // Color primario del producto en la API (recepción)
  secret?: boolean; // Si el producto es secreto en la API (recepción)
}

export type CustomizationType = 'burger' | 'papas' | 'none';

export type Product = {
  id: number;
  name: string;
  price: number;
  basePrice: number;
  body: string;
  bigImage: string;
  image1: string;
  image2?: string | null;
  quantity: number;
  icons: React.FC<LogoProps>[];
  complements: Complement[];
  allowCustomization: boolean;
  customizationType: CustomizationType;
};
