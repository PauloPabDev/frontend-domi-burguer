"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/products";
import { showFoodToast } from "@/components/toastFood";

export interface CardImageConfig {
  src: string;
  alt: string;
  className: string;
  width: number;
  height: number;
}

interface ProductThumbnailProps {
  product: Product;
  isActive: boolean;
  onSelect: () => void;
  onAddToCart: (product: Product) => void;
  images: CardImageConfig[];
}

export function ProductThumbnail({
  product,
  isActive,
  onSelect,
  onAddToCart,
  images,
}: ProductThumbnailProps) {
  return (
    <div
      className={`w-[160px] h-[160px] lg:w-[280px] lg:h-40 ${isActive ? "bg-accent-yellow-40" : "bg-accent-yellow-20"} rounded-2xl border-0 overflow-visible`}
      onClick={onSelect}
    >
      <div className="relative gap-[4.47px] p-0 h-full">
        {images.map((img) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            className={img.className}
          />
        ))}
        <Button
          variant="primary"
          size="icon-sm"
          className={`absolute z-10 top-[5px] right-[5px] lg:top-[7px] lg:left-[232px] lg:w-10 lg:h-10 ${isActive ? "hidden" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
            showFoodToast(product.name);
          }}
        >
          <Plus className="text-white" />
        </Button>
      </div>
    </div>
  );
}

export const PRODUCT_CARD_IMAGES: CardImageConfig[][] = [
  // Hamburguesa Artesanal
  [{
    src: "/images/products/burger-card.webp",
    alt: "Burger",
    width: 140,
    height: 220,
    className: "absolute top-[8px] left-[36px] lg:top-[-30px] lg:left-[70px] h-[149px] w-[94px] lg:w-[140.16px] lg:h-[220px] object-cover",
  }],
  // Combo (2 imágenes)
  [
    {
      src: "/images/products/burger-card.webp",
      alt: "Burger",
      width: 140,
      height: 220,
      className: "absolute top-[8px] left-[25px] lg:top-[-30px] lg:left-[45px] h-[149px] w-[94px] lg:w-[140.16px] lg:h-[220px] object-cover",
    },
    {
      src: "/images/products/fries-card.webp",
      alt: "Papas del combo",
      width: 119,
      height: 178,
      className: "absolute top-[35px] left-[68px] lg:top-[23px] lg:left-[121px] w-[84px] h-[126px] lg:w-[119px] lg:h-[178px] object-cover",
    },
  ],
  // Salsa de Ajo
  [{
    src: "/images/products/sauce-card.webp",
    alt: "Salsa de Ajo",
    width: 308,
    height: 221,
    className: "absolute top-[28px] lg:top-[-30px] w-[178px] h-[128px] lg:w-[308px] lg:h-[221px]",
  }],
  // Papas Vaquera
  [{
    src: "/images/products/vaquera-card.webp",
    alt: "Papas Vaquera",
    width: 153,
    height: 230,
    className: "absolute top-[-0px] left-[26px] lg:top-[-38px] lg:left-[69px] w-[110px] h-[166px] lg:w-[153px] lg:h-[230px] object-cover",
  }],
  // Papas Troyana
  [{
    src: "/images/products/troyana-card.webp",
    alt: "Papas Troyana",
    width: 153,
    height: 230,
    className: "absolute top-[-0px] left-[26px] lg:top-[-38px] lg:left-[69px] w-[110px] h-[166px] lg:w-[153px] lg:h-[230px] object-cover",
  }],
  // Cheesecake de Fresa
  [{
    src: "/images/products/cheesecake-card.webp",
    alt: "Cheesecake de Fresa",
    width: 153,
    height: 230,
    className: "absolute top-[-0px] left-[26px] lg:top-[-38px] lg:left-[69px] w-[110px] h-[166px] lg:w-[153px] lg:h-[230px] object-cover",
  }],
  // Jugo Natural de Mora
  [{
    src: "/images/products/blackberry-juice-card.webp",
    alt: "Jugo Natural de Mora",
    width: 153,
    height: 230,
    className: "absolute top-[-0px] left-[26px] lg:top-[-38px] lg:left-[69px] w-[110px] h-[166px] lg:w-[153px] lg:h-[230px] object-cover",
  }],
];
