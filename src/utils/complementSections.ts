import {
  CarneIcon,
  FrenchFriesIcon,
  LechugaIcon,
  PicklesIcon,
  QuesoIcon,
  SouceIcon,
  TocinetaIcon,
  TomateIcon,
  LogoProps,
  AjoIcon,
  CebollaIcon,
  CloseIcon,

} from "@/components/ui/icons";
import { Complement } from "@/types/products";
import { CupSoda } from "lucide-react";
const iconMap: { [key: string]: React.FC<LogoProps> } = {
  CarneIcon,
  FrenchFriesIcon,
  LechugaIcon,
  CebollaIcon,
  PicklesIcon,
  QuesoIcon,
  SouceIcon,
  TocinetaIcon,
  TomateIcon,
  CupSoda,
  AjoIcon,
  CloseIcon
};


// FAVORITOS - Ingredientes principales
const favoritosData: Complement[] = [
  {
    id: 16,
    name: "Coquitas Blancas en las papas",
    price: null,
    icon: "SouceIcon",
    quantity: 1,
    type: "addable",
    additionId: 16,
    minusComplement: false,
  },
  // Sin Salsas
  {
    id: 15,
    name: "Sin Salsas",
    price: null,
    icon: "CloseIcon",
    quantity: 1,
    type: "addable",
    additionId: 15,
    minusComplement: false,
  },
  // Sin pepino
  {
    id: 288,
    name: "Pepinillos",
    price: null,
    icon: "PicklesIcon",
    quantity: 0,
    type: "special",
    additionId: 28,
    minusId: 13,
    minusComplement: false,
  },
  // Sin cebolla
  {
    id: 289,
    name: "Cebolla",
    price: null,
    icon: "AjoIcon",
    quantity: 0,
    type: "special",
    additionId: 32,
    minusId: 11,
    minusComplement: false,
  },
];

// OTROS - Ingredientes secundarios y vegetales
const otrosData: Complement[] = [

  {
    id: 1002,
    name: "Carne",
    price: 6500,
    icon: "CarneIcon",
    quantity: 1,
    type: "special",
    additionId: 4,
    minusId: 20,
    minusComplement: false,
  },
  {
    id: 244,
    name: "Queso americano",
    price: 3000,
    icon: "QuesoIcon",
    quantity: 1,
    type: "special",
    additionId: 5,
    minusId: 24,
    minusComplement: false,
  },
  {
    id: 666,
    name: "Tocineta",
    price: 4000,
    icon: "TocinetaIcon",
    quantity: 1,
    type: "special",
    additionId: 6,
    minusId: 18,
    minusComplement: false,
  },
  {
    id: 7,
    name: "Papas rizadas",
    price: 6000,
    icon: "FrenchFriesIcon",
    quantity: 0,
    type: "addable",
    additionId: 7,
    minusComplement: false,
  },
  {
    id: 14,
    name: "Lechuga",
    price: null,
    icon: "LechugaIcon",
    quantity: 1,
    type: "special",
    additionId: 29,
    minusId: 14,
    minusComplement: false,
  },
  {
    id: 300,
    name: "Tomate",
    price: null,
    icon: "TomateIcon",
    quantity: 1,
    type: "special",
    additionId: 30,
    minusId: 12,
    minusComplement: false,
  },
  {
    id: 23,
    name: "Salsa de Ajo",
    price: null,
    icon: "AjoIcon",
    quantity: 1,
    type: "removable",
    additionId: 3,
    minusId: 23,
    minusComplement: false,
  },
  {
    id: 22,
    name: "Salsa Roja",
    price: null,
    icon: "SouceIcon",
    quantity: 1,
    type: "removable",
    additionId: 8,
    minusId: 22,
    minusComplement: false,
  },

  {
    id: 73,
    name: "Sin vegetales",
    price: null,
    icon: "LechugaIcon",
    quantity: 0,
    type: "addable",
    additionId: 19,
    minusComplement: false,
  },

];

// GASEOSAS - Bebidas
const gaseosasData: Complement[] = [
  {
    id: 10,
    name: "Coca-Cola personal",
    price: 4000,
    icon: "CupSoda",
    quantity: 0,
    type: "addable",
    additionId: 10,
    minusComplement: false,
  },
  {
    id: 9,
    name: "Coca-Cola 1/ litro",
    price: 9000,
    icon: "CupSoda",
    quantity: 0,
    type: "addable",
    additionId: 9,
    minusComplement: false,
  },
];

const salsasData: Complement[] = [
  {
    id: 71,
    name: "1 oz Salsa de Ajo",
    price: 2000,
    icon: "AjoIcon",
    quantity: 0,
    type: "addable",
    additionId: 3,
    minusComplement: false,
  },
  {
    id: 72,
    name: "1 oz salsa roja",
    price: 1500,
    icon: "TomateIcon",
    quantity: 0,
    type: "addable",
    additionId: 8,
    minusComplement: false,
  },
  //sin salsas
  {
    id: 15,
    name: "Sin Salsas",
    price: null,
    icon: "CloseIcon",
    quantity: 0,
    type: "addable",
    additionId: 15,
    minusComplement: false,
  },
  //solo coquitas blancas
  {
    id: 16,
    name: "Coquitas Blancas en las papas",
    price: null,
    icon: "SouceIcon",
    quantity: 0,
    type: "addable",
    additionId: 16,
    minusComplement: false,
  },
  //solo coquitas rojas
  {
    id: 17,
    name: "Coquitas Rojas en las papas",
    price: null,
    icon: "SouceIcon",
    quantity: 0,
    type: "addable",
    additionId: 17,
    minusComplement: false,
  },
  // Solo salsa Roja en la hamburguesa
  {
    id: 23,
    name: "Solo Salsa Roja en la hamburguesa",
    price: null,
    icon: "SouceIcon",
    quantity: 0,
    type: "addable",
    additionId: 23,
    minusComplement: false,
  },
  // Solo salsa Blanca en la hamburguesa.
  {
    id: 22,
    name: "Solo Salsa Blanca en la hamburguesa",
    price: null,
    icon: "SouceIcon",
    quantity: 0,
    type: "addable",
    additionId: 22,
    minusComplement: false,
  },
  // Salsas aparte de la hamburguesa
  {
    id: 27,
    name: "Salsas aparte de la hamburguesa",
    price: null,
    icon: "SouceIcon",
    quantity: 0,
    type: "addable",
    additionId: 27,
    minusComplement: false,
  },
];

// Salsas específicas para papas (sin opciones de hamburguesa)
const salsasPapasData: Complement[] = [
  {
    id: 71,
    name: "1 oz Salsa de Ajo",
    price: 2000,
    icon: "AjoIcon",
    quantity: 0,
    type: "addable",
    additionId: 3,
    minusComplement: false,
  },
  {
    id: 72,
    name: "1 oz salsa roja",
    price: 1500,
    icon: "TomateIcon",
    quantity: 0,
    type: "addable",
    additionId: 8,
    minusComplement: false,
  },
  {
    id: 15,
    name: "Sin Salsas",
    price: null,
    icon: "CloseIcon",
    quantity: 0,
    type: "addable",
    additionId: 15,
    minusComplement: false,
  },
  {
    id: 16,
    name: "Coquitas Blancas en las papas",
    price: null,
    icon: "SouceIcon",
    quantity: 0,
    type: "addable",
    additionId: 16,
    minusComplement: false,
  },
  {
    id: 17,
    name: "Coquitas Rojas en las papas",
    price: null,
    icon: "SouceIcon",
    quantity: 0,
    type: "addable",
    additionId: 17,
    minusComplement: false,
  },
];


export {
  favoritosData,
  otrosData,
  gaseosasData,
  salsasData,
  salsasPapasData,
  iconMap
};