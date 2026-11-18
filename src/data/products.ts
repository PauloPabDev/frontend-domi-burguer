import {
  CarneIcon,
  TomateIcon,
  QuesoIcon,
  TocinetaIcon,
  // LechugaIcon, // solo lo usa el sánduche retirado
  HamburgerIcon,
  FrenchFriesIcon,
  HuevoIcon,
  AjoIcon,
} from "@/components/ui/icons";
import { Product } from "@/types/products";
import generated from "./prices.generated.json";

// Precios consultados a la API al compilar (scripts/sync-products.mjs); la clave es el id del producto en la API
const prices: Record<string, number> = generated.prices;
export const priceOf = (id: number | string) => prices[id];
// true solo en desarrollo, cuando el servidor de pruebas no respondió y se usó el mock
export const USING_MOCK_PRICES = generated.source === "mock";

export const PRODUCTS: Product[] = [
  {
    id: 2,
    slug: "hamburguesa",
    name: "HAMBURGUESA ARTESANAL",
    basePrice: priceOf(2),
    price: priceOf(2),
    body: "Pan artesanal hecho en casa, carne jugosa, tocineta crocante, queso mozzarella lechuga fresca, tomate , pepinos, cebolla y el toque de nuestra Salsa de Ajo.",
    bigImage: "/images/products/burger-large.webp",
    image1: "/images/products/burger-thumbnail.webp",
    icons: [CarneIcon, TomateIcon, QuesoIcon, TocinetaIcon],
    quantity: 1,
    complements: [],
    allowCustomization: true,
    customizationType: "burger",
  },
  {
    id: 1,
    slug: "combo",
    name: "COMBO",
    basePrice: priceOf(1),
    price: priceOf(1),
    body: "Nuestra hamburguesa, acompañada de papas rizadas crocantes y nuestra coquitas de Salsa de Ajo y salsa roja.",
    bigImage: "/images/products/combo-large.webp",
    image1: "/images/products/combo-thumbnail.webp",
    icons: [HamburgerIcon, FrenchFriesIcon],
    quantity: 1,
    complements: [],
    allowCustomization: true,
    customizationType: "burger",
  },
  {
    id: 38,
    slug: "salsa-de-ajo",
    name: "SALSA DE AJO",
    basePrice: priceOf(38),
    price: priceOf(38),
    body: "Cremosa, intensa y perfectamente balanceada, nuestra receta familiar de Salsa de Ajo. Es el secreto que se queda en tu memoria.",
    bigImage: "/images/products/garlic-sauce-large.webp",
    image1: "/images/products/sauce-thumbnail.webp",
    icons: [HuevoIcon, AjoIcon],
    quantity: 1,
    complements: [],
    allowCustomization: true,
    customizationType: "burger",
  },
  {
    id: 39,
    slug: "papas-vaquera",
    name: "PAPAS VAQUERA",
    basePrice: priceOf(39),
    price: priceOf(39),
    body: "Nuestras deliciosas papas con el toque especial de la casa, crujientes por fuera y suaves por dentro.",
    bigImage: "/images/products/vaquera-large.webp",
    image1: "/images/products/vaquera-card.webp",
    icons: [FrenchFriesIcon],
    quantity: 1,
    complements: [],
    allowCustomization: true,
    customizationType: "papas",
  },
  {
    id: 40,
    slug: "papas-troyana",
    name: "PAPAS TROYANA",
    basePrice: priceOf(40),
    price: priceOf(40),
    body: "Papas premium cargadas con todos los ingredientes, una explosión de sabor en cada bocado.",
    bigImage: "/images/products/troyana-large.webp",
    image1: "/images/products/troyana-card.webp",
    icons: [FrenchFriesIcon],
    quantity: 1,
    complements: [],
    allowCustomization: true,
    customizationType: "papas",
  },
  // ───────────────────────────────────────────────────────────────
  // PRODUCTOS RETIRADOS TEMPORALMENTE (hasta nuevo aviso)
  // Para reactivarlos: descomentar el bloque, volver a importar LechugaIcon
  // y moverlo a su posición en la lista. Las imágenes siguen en /public/images/products.
  // Al reactivarlos hay que añadir su id a src/data/prices.mock.json y usar priceOf(id).
  // ───────────────────────────────────────────────────────────────

  // {
  //   id: 48,
  //   slug: "sanduche",
  //   name: "SÁNDUCHE ARTESANAL",
  //   basePrice: 18000,
  //   price: 18000,
  //   body: "Sánduche artesanal con mermelada de tocineta (con trocitos de cebolla caramelizada ), Salsa de Ajo, queso mozzarella , tomate, lechuga fresca y pan hecho en casa.", // TODO: descripción provisional
  //   bigImage: "/images/products/sandwich-large.webp",
  //   image1: "/images/products/sandwich-thumbnail.webp",
  //   icons: [TocinetaIcon, QuesoIcon, LechugaIcon],
  //   quantity: 1,
  //   complements: [],
  //   allowCustomization: true,
  //   customizationType: "burger",
  //   isNew: true,
  // },

  // {
  //   id: 43,
  //   slug: "cheesecake",
  //   name: "CHEESECAKE DE FRESA",
  //   basePrice: 14000,
  //   price: 14000,
  //   body: "Nuestro delicioso Cheesecake de fresa cremoso con base crocante y cobertura de fresas, un deleite para tu paladar.",
  //   bigImage: "/images/products/cheesecake-large.webp",
  //   image1: "/images/products/cheesecake-card.webp",
  //   icons: [],
  //   quantity: 1,
  //   complements: [],
  //   allowCustomization: true,
  //   customizationType: "burger",
  //   soldOut: true,
  // },
];

// Foto pequeña del producto desde el catálogo local (los pedidos no guardan la foto)
export const getProductImage = (id: string | number) => PRODUCTS.find((p) => p.id === Number(id))?.image1;
